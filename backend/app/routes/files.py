"""
app/routes/files.py — FIXED VERSION (download double-count removed)

ROOT CAUSE OF "Failed to fetch":
  - Flask's send_from_directory works fine, but when called from a React app
    at localhost:3000 → Flask at localhost:5000, the browser enforces CORS.
  - Authenticated routes (manuscript download) were missing CORS headers
    on the actual file response (Flask-CORS covers API routes but
    send_from_directory can bypass the headers in some configs).
  - Public article routes work ONLY when the article's pdf_url actually
    points to an existing file in UPLOAD_FOLDER.

FIXES APPLIED:
  1. after_request hook adds CORS headers to ALL responses from this blueprint
  2. Correct MIME type detection from actual file extension
  3. Article view endpoint checks file existence before serving
  4. Token from ?token= param OR Authorization header (for window.open() calls)
  5. Better error messages that distinguish "no file" from "file missing on disk"
  6. FIX (2026-06): removed the downloads += 1 here — the frontend already
     calls POST /api/articles/<id>/download before fetching this file, so
     incrementing here too was counting every download TWICE.
"""
import os
import mimetypes
from flask import (
    Blueprint, send_from_directory, jsonify,
    current_app, request, make_response, after_this_request
)
from flask_jwt_extended import decode_token
from app.models import Manuscript, Article, User
from app import db

files_bp = Blueprint("files", __name__)


def _add_cors(response):
    """Add CORS headers so the browser doesn't block file responses."""
    response.headers['Access-Control-Allow-Origin']  = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Type'
    return response


@files_bp.after_request
def after_request(response):
    return _add_cors(response)


def _auth_user():
    """Authenticate via ?token= query param or Authorization header."""
    token = request.args.get("token", "").strip()
    if not token:
        h = request.headers.get("Authorization", "")
        if h.startswith("Bearer "):
            token = h.split(" ", 1)[1]
    if not token:
        return None
    try:
        data    = decode_token(token)
        user_id = int(data["sub"])        # identity is str(user.id)
        return User.query.get(user_id)
    except Exception:
        return None


def _get_mime(filename):
    """Return correct MIME type for the file extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    mime_map = {
        "pdf":  "application/pdf",
        "doc":  "application/msword",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return mime_map.get(ext, mimetypes.guess_type(filename)[0] or "application/octet-stream")


def _safe_send(folder, filename, download=False, download_name=None):
    """
    Serve a file from folder.
    - download=True → Content-Disposition: attachment (triggers browser save)
    - download=False → Content-Disposition: inline (browser tries to display)
    """
    filepath = os.path.join(folder, filename)
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found on server"}), 404

    mime       = _get_mime(filename)
    dl_name    = download_name or filename
    disposition = "attachment" if download else "inline"

    return send_from_directory(
        folder,
        filename,
        mimetype=mime,
        as_attachment=download,
        download_name=dl_name,
    )


# ── OPTIONS pre-flight ─────────────────────────────────────────────────────────

@files_bp.route("/manuscript/<int:ms_id>", methods=["OPTIONS"])
@files_bp.route("/article/<int:article_id>/view", methods=["OPTIONS"])
@files_bp.route("/article/<int:article_id>/pdf", methods=["OPTIONS"])
def options_handler(**kwargs):
    response = make_response("", 200)
    return _add_cors(response)


# ── Manuscript download (authenticated) ───────────────────────────────────────

@files_bp.route("/manuscript/<int:ms_id>", methods=["GET"])
def download_manuscript(ms_id):
    """
    Download/view a manuscript file.
    Requires: admin, editor, or reviewer JWT token.
    Pass token as ?token=<jwt> (for window.open) or Authorization header (for fetch).
    """
    user = _auth_user()
    if not user or not user.is_active:
        return jsonify({"error": "Valid authorization token required"}), 401
    if user.role.name not in ("admin", "editor", "reviewer"):
        return jsonify({"error": "Insufficient permissions"}), 403

    ms = Manuscript.query.get_or_404(ms_id)
    if not ms.file_path:
        return jsonify({"error": "No file attached to this manuscript"}), 404

    folder   = current_app.config["UPLOAD_FOLDER"]
    filename = ms.file_path
    filepath = os.path.join(folder, filename)

    if not os.path.exists(filepath):
        current_app.logger.warning(f"Manuscript file missing: {filepath}")
        return jsonify({
            "error": "File missing from server storage. The file may have been uploaded "
                     "to a different server instance. Please ask the author to resubmit."
        }), 404

    # Detect extension for correct filename
    ext      = filename.rsplit(".", 1)[-1].lower() if "." in filename else "docx"
    safe     = (ms.title[:40]
                .replace(" ", "_")
                .replace("/", "-")
                .replace("\\", "")
                .replace(":", ""))
    dl_name  = f"{ms.manuscript_number}_{safe}.{ext}"

    # PDF: serve inline so browser can display it
    # DOC/DOCX: serve as attachment (browser can't display them)
    as_attachment = ext in ("doc", "docx")

    return send_from_directory(
        folder,
        filename,
        mimetype=_get_mime(filename),
        as_attachment=as_attachment,
        download_name=dl_name,
    )


# ── Public article file (no auth — open access) ───────────────────────────────

@files_bp.route("/article/<int:article_id>/view", methods=["GET"])
def view_article(article_id):
    """
    Public endpoint to view/download a published article.
    No authentication required (open access journal).
    ?download=1 → force "attachment" Content-Disposition; otherwise serve inline.

    NOTE: download counting does NOT happen here anymore. It happens ONLY in
    articles.py's POST /articles/<id>/download, which the frontend calls
    BEFORE fetching this file. Counting here too caused every download to be
    recorded twice.
    """
    article = Article.query.get_or_404(article_id)
    if article.status != "published":
        return jsonify({"error": "Article not yet published"}), 404

    force_download = request.args.get("download", "0") == "1"

    folder = current_app.config["UPLOAD_FOLDER"]

    # ── Option A: article has its own pdf_url (explicit upload) ───────────────
    if article.pdf_url:
        if article.pdf_url.startswith("http"):
            # External URL — redirect
            from flask import redirect
            return redirect(article.pdf_url)

        filepath = os.path.join(folder, article.pdf_url)
        if os.path.exists(filepath):
            ext     = article.pdf_url.rsplit(".", 1)[-1].lower() if "." in article.pdf_url else "pdf"
            dl_name = f"IJTD_{(article.doi or str(article.id)).replace('/', '_')}.{ext}"
            return send_from_directory(
                folder,
                article.pdf_url,
                mimetype=_get_mime(article.pdf_url),
                as_attachment=force_download,
                download_name=dl_name,
            )
        else:
            current_app.logger.warning(
                f"Article {article_id} pdf_url={article.pdf_url!r} "
                f"but file missing at {filepath}"
            )

    # ── Option B: fall back to the original manuscript file ───────────────────
    ms = Manuscript.query.filter(
        Manuscript.title == article.title,
        Manuscript.status == "published",
    ).first()

    if ms and ms.file_path:
        filepath = os.path.join(folder, ms.file_path)
        if os.path.exists(filepath):
            ext     = ms.file_path.rsplit(".", 1)[-1].lower() if "." in ms.file_path else "docx"
            dl_name = f"IJTD_{(article.doi or str(article.id)).replace('/', '_')}.{ext}"
            return send_from_directory(
                folder,
                ms.file_path,
                mimetype=_get_mime(ms.file_path),
                as_attachment=force_download,
                download_name=dl_name,
            )

    return jsonify({
        "error": "Full text not yet available. The editorial team will upload the PDF shortly.",
        "article_id": article_id,
        "title": article.title,
    }), 404


# ── Backward-compat alias ──────────────────────────────────────────────────────

@files_bp.route("/article/<int:article_id>/pdf", methods=["GET"])
def download_article_pdf(article_id):
    """Alias — same as /view?download=1"""
    return view_article(article_id)