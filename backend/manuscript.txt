"""
app/routes/manuscripts.py
Fixed: sends email to author AND admin, proper error logging,
       Word-only submissions, admin notification on every submission.
"""
import os, uuid, logging
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request, current_app
from werkzeug.utils import secure_filename
from flask_mail import Message
from app import db, mail
from app.models import Manuscript

manuscripts_bp = Blueprint("manuscripts", __name__)
logger = logging.getLogger(__name__)

ALLOWED_EXTS = {"doc", "docx"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTS

def generate_manuscript_number():
    year = datetime.now(timezone.utc).year
    last = (
        Manuscript.query
        .filter(Manuscript.manuscript_number.like(f"IJTD-{year}-%"))
        .order_by(Manuscript.id.desc())
        .first()
    )
    seq = int(last.manuscript_number.split("-")[-1]) + 1 if last else 1
    return f"IJTD-{year}-{seq:05d}"

# ─────────────────────────────────────────────────────────
# Core send helper — logs the REAL error so you can debug
# ─────────────────────────────────────────────────────────
def _send_email(subject, html, recipients):
    """
    Send an HTML email via Flask-Mail.
    Returns True on success, False on failure.
    Logs the REAL error message — never silently discards.
    """
    username = current_app.config.get("MAIL_USERNAME", "")
    if not username:
        logger.error(
            "EMAIL NOT SENT: MAIL_USERNAME is empty in Flask config. "
            "Check your .env file has MAIL_USERNAME set and that "
            "app/__init__.py loads it into app.config."
        )
        return False

    suppress = current_app.config.get("MAIL_SUPPRESS_SEND", False)
    if suppress:
        logger.error(
            "EMAIL NOT SENT: MAIL_SUPPRESS_SEND=True in Flask config. "
            "Add  app.config['MAIL_SUPPRESS_SEND'] = False  in your app factory."
        )
        return False

    try:
        sender = (
            current_app.config.get("MAIL_DEFAULT_SENDER")
            or current_app.config.get("MAIL_USERNAME")
        )
        msg = Message(subject=subject, recipients=recipients, html=html, sender=sender)
        mail.send(msg)
        logger.info(f"Email sent to {recipients}: {subject}")
        return True
    except Exception as exc:
        logger.error(
            f"EMAIL FAILED to {recipients}: {subject}\n"
            f"Error type : {type(exc).__name__}\n"
            f"Error detail: {exc}\n"
            "Run  python test_email.py  to diagnose SMTP credentials."
        )
        return False

# ─────────────────────────────────────────────────────────
# Email: author confirmation
# ─────────────────────────────────────────────────────────
def send_author_confirmation(ms):
    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    subject  = f"[IJTD] Manuscript Received — {ms.manuscript_number}"
    html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb">
  <div style="background:#0B1E3D;padding:22px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:18px">International Journal of Transformative Development</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:12px">IJTD — ASAIE Publishing, Yaoundé, Cameroon</p>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    <h2 style="color:#0B1E3D;margin-top:0">Manuscript Received ✅</h2>
    <p>Dear Author,</p>
    <p>Thank you for submitting your manuscript to IJTD. We have received your Word document
       and it is now awaiting editorial assignment.</p>
    <div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:20px 0">
      <p style="margin:0 0 6px"><strong>Manuscript Number:</strong>
         <span style="font-family:monospace;font-size:15px;color:#1d4ed8">{ms.manuscript_number}</span></p>
      <p style="margin:0 0 6px"><strong>Title:</strong> {ms.title}</p>
      <p style="margin:0 0 6px"><strong>Type:</strong> {ms.manuscript_type}</p>
      <p style="margin:0"><strong>Submitted:</strong>
         {ms.submitted_at.strftime('%B %d, %Y') if ms.submitted_at else 'Today'}</p>
    </div>
    <p>Please save your manuscript number — you need it to track your submission.</p>
    <h3 style="color:#0B1E3D">What happens next?</h3>
    <ol style="line-height:1.9;color:#374151">
      <li>Editor reviews your submission and assigns a peer reviewer.</li>
      <li>Reviewer evaluates your manuscript (2–3 weeks).</li>
      <li>If <strong>accepted</strong> you receive payment instructions for the APC.</li>
      <li>After payment the editorial team formats and publishes your article.</li>
    </ol>
    <div style="text-align:center;margin:24px 0">
      <a href="{frontend}/track-manuscript"
         style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;
                text-decoration:none;font-weight:600;display:inline-block">
        Track My Submission
      </a>
    </div>
    <p style="color:#6b7280;font-size:13px">
      Questions? Email <a href="mailto:contact@ijtd.com">contact@ijtd.com</a>
    </p>
  </div>
</div>"""
    return _send_email(subject, html, [ms.corresponding_email])

# ─────────────────────────────────────────────────────────
# Email: admin/editor new submission alert
# ─────────────────────────────────────────────────────────
def send_admin_notification(ms):
    # ADMIN_EMAIL in .env → where editorial alerts go
    admin_email = os.getenv("ADMIN_EMAIL", "").strip()
    if not admin_email:
        # Fall back to MAIL_USERNAME
        admin_email = current_app.config.get("MAIL_USERNAME", "").strip()
    if not admin_email:
        logger.warning("Admin notification skipped: ADMIN_EMAIL not set in .env")
        return False

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    subject  = f"[IJTD] New Submission — {ms.manuscript_number}"
    html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fffbeb">
  <div style="background:#92400e;padding:18px;border-radius:8px 8px 0 0;text-align:center">
    <h2 style="color:#fff;margin:0;font-size:16px">📄 New Manuscript Submission</h2>
    <p style="color:#fde68a;margin:4px 0 0;font-size:12px">IJTD Editorial Office</p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #fde68a;border-top:none;border-radius:0 0 8px 8px">
    <p>A new manuscript requires editorial assignment.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="background:#fffbeb">
        <td style="padding:8px 12px;font-weight:bold;border:1px solid #fde68a;width:35%">MS Number</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;font-family:monospace;color:#92400e">{ms.manuscript_number}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;border:1px solid #fde68a">Type</td>
        <td style="padding:8px 12px;border:1px solid #fde68a">{ms.manuscript_type}</td>
      </tr>
      <tr style="background:#fffbeb">
        <td style="padding:8px 12px;font-weight:bold;border:1px solid #fde68a">Title</td>
        <td style="padding:8px 12px;border:1px solid #fde68a">{ms.title}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;border:1px solid #fde68a">Authors</td>
        <td style="padding:8px 12px;border:1px solid #fde68a">{ms.authors}</td>
      </tr>
      <tr style="background:#fffbeb">
        <td style="padding:8px 12px;font-weight:bold;border:1px solid #fde68a">Corresponding</td>
        <td style="padding:8px 12px;border:1px solid #fde68a">{ms.corresponding_email}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;border:1px solid #fde68a">Submitted</td>
        <td style="padding:8px 12px;border:1px solid #fde68a">
          {ms.submitted_at.strftime('%B %d, %Y %H:%M UTC') if ms.submitted_at else 'Now'}
        </td>
      </tr>
    </table>
    <div style="text-align:center;margin:20px 0">
      <a href="{frontend}/admin/manuscripts"
         style="background:#92400e;color:#fff;padding:12px 28px;border-radius:8px;
                text-decoration:none;font-weight:600;display:inline-block">
        Open Editorial Dashboard
      </a>
    </div>
  </div>
</div>"""
    return _send_email(subject, html, [admin_email])

# ─────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────
@manuscripts_bp.route("/submit", methods=["POST", "OPTIONS"])
def submit_manuscript():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.form
    missing = [f for f in ["manuscriptType","title","abstract","keywords","authors","email"]
               if not data.get(f, "").strip()]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # File validation — Word only
    if "file" not in request.files:
        return jsonify({"error": "A Word document (.doc or .docx) is required."}), 400

    f = request.files["file"]
    if not f or not f.filename:
        return jsonify({"error": "Empty file upload."}), 400

    if not allowed_file(f.filename):
        ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else "unknown"
        return jsonify({
            "error": (
                f"File type .{ext} is not accepted. "
                "IJTD requires Word documents (.doc or .docx) only. "
                "Do NOT submit a PDF — the editorial team creates the formatted "
                "PDF after acceptance."
            )
        }), 400

    folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(folder, exist_ok=True)
    unique_fn = f"{uuid.uuid4().hex}_{secure_filename(f.filename)}"
    f.save(os.path.join(folder, unique_fn))

    ms = Manuscript(
        manuscript_number   = generate_manuscript_number(),
        manuscript_type     = data["manuscriptType"].strip(),
        title               = data["title"].strip(),
        abstract            = data["abstract"].strip(),
        keywords            = data["keywords"].strip(),
        authors             = data["authors"].strip(),
        corresponding_email = data["email"].strip().lower(),
        file_path           = unique_fn,
        status              = "submitted",
    )
    db.session.add(ms)
    db.session.commit()
    logger.info(f"New submission: {ms.manuscript_number}")

    # Send both emails — non-blocking
    author_ok = send_author_confirmation(ms)
    admin_ok  = send_admin_notification(ms)

    if not author_ok:
        logger.error(f"Author confirmation NOT sent for {ms.manuscript_number} — check Flask-Mail config")
    if not admin_ok:
        logger.error(f"Admin alert NOT sent for {ms.manuscript_number} — check ADMIN_EMAIL in .env")

    return jsonify({
        "message":           "Manuscript submitted successfully.",
        "manuscript_number": ms.manuscript_number,
        "email_sent":        author_ok,
    }), 201


@manuscripts_bp.route("/track", methods=["GET"])
def track_manuscript():
    email  = request.args.get("email", "").strip().lower()
    ms_num = request.args.get("manuscript_number", "").strip()
    if not email:
        return jsonify({"error": "Email is required"}), 400
    q = Manuscript.query.filter(Manuscript.corresponding_email.ilike(email))
    if ms_num:
        q = q.filter(Manuscript.manuscript_number.ilike(ms_num))
    manuscripts = q.order_by(Manuscript.submitted_at.desc()).all()
    if not manuscripts:
        return jsonify({"error": "No manuscripts found for the provided details"}), 404
    return jsonify([ms.to_dict() for ms in manuscripts])