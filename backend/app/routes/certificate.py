"""
app/routes/certificate.py
Publication certificate — pure HTML, no external PDF library needed.
Opens in browser; author clicks Print → Save as PDF.

FIX: Previous version returned 204 (empty) because reportlab was not installed.
     This version uses only Python built-ins — zero extra dependencies.
"""
from flask import Blueprint, jsonify, request, Response
from app.models import Manuscript, Article

certificate_bp = Blueprint("certificate", __name__)

# ── Certificate HTML template (inline, no file needed) ────────────────────────
_CERT_HTML = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Certificate of Publication — IJTD</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#f0f4f8;display:flex;justify-content:center;padding:40px 20px;min-height:100vh}
.page{background:#fff;width:800px;padding:64px;box-shadow:0 8px 40px rgba(0,0,0,.15);position:relative;border:1px solid #e5e7eb}
.page::before{content:'';position:absolute;inset:14px;border:2.5px solid #0066CC;pointer-events:none}
.page::after{content:'';position:absolute;inset:21px;border:1px solid #C8A84B;pointer-events:none}
.top{text-align:center;margin-bottom:28px}
.jname{font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#0B1E3D;margin-bottom:4px}
.issn{font-size:11px;color:#777;letter-spacing:.5px}
.gold-bar{width:80px;height:3px;background:linear-gradient(90deg,#C8A84B,#f0d070,#C8A84B);margin:20px auto;border-radius:2px}
.cert-heading{font-family:'Playfair Display',serif;font-size:38px;font-weight:900;color:#0B1E3D;text-align:center;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px}
.cert-sub{font-size:11px;color:#999;text-align:center;letter-spacing:4px;text-transform:uppercase;margin-bottom:36px}
.body{text-align:center}
.body p{font-size:14px;color:#555;line-height:1.7}
.title-box{border-left:4px solid #0066CC;background:#f8f9ff;padding:16px 22px;margin:18px 0;text-align:left;border-radius:0 8px 8px 0}
.title-box p{font-family:'Playfair Display',serif;font-size:17px;color:#0B1E3D;line-height:1.5;font-style:italic}
.authors{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#0B1E3D;margin:18px 0}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:28px 0}
.meta-box{background:#f8f9ff;border-radius:8px;padding:14px 18px}
.meta-box .label{font-size:10px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
.meta-box .val{font-size:14px;font-weight:600;color:#0B1E3D}
.sigs{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:44px;padding-top:32px}
.sig{text-align:center}
.sig-line{border-top:1px solid #999;margin-bottom:8px}
.sig-name{font-weight:700;font-size:13px;color:#0B1E3D}
.sig-role{font-size:11px;color:#777;margin-top:2px}
.seal{position:absolute;bottom:80px;right:70px;width:86px;height:86px;border-radius:50%;border:3px solid #C8A84B;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff}
.seal-text{font-size:7.5px;font-weight:700;color:#C8A84B;text-align:center;letter-spacing:.5px;line-height:1.5;text-transform:uppercase}
.foot{text-align:center;margin-top:36px;font-size:10px;color:#bbb}
.print-btn{position:fixed;top:24px;right:24px;background:#0066CC;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(0,102,204,.3)}
.print-btn:hover{background:#0052a3}
@media print{body{background:#fff;padding:0}.page{box-shadow:none}.print-btn{display:none}}
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">&#x1F5A8; Save as PDF</button>
<div class="page">
  <div class="top">
    <div class="jname">International Journal of Transformative Development (IJTD)</div>
    <div class="issn">ISSN Online: 1434-6036 &nbsp;&bull;&nbsp; ISSN Print: 1434-6028 &nbsp;&bull;&nbsp; Impact Factor: 10 &nbsp;&bull;&nbsp; Open Access</div>
  </div>

  <div class="gold-bar"></div>
  <div class="cert-heading">Certificate of Publication</div>
  <div class="cert-sub">Official Recognition of Scholarly Contribution</div>

  <div class="body">
    <p>This is to certify that the following research work</p>
    <div class="title-box"><p>__TITLE__</p></div>
    <p>authored by</p>
    <div class="authors">__AUTHORS__</div>
    <p>has been peer-reviewed and officially published in the<br>
    <strong>International Journal of Transformative Development</strong>,<br>
    published by the African Scientific Association for Innovative and Entrepreneurship (ASAIE),<br>
    Yaound&eacute;, Cameroon.</p>
  </div>

  <div class="meta">
    <div class="meta-box"><div class="label">Manuscript Number</div><div class="val">__MSNUM__</div></div>
    <div class="meta-box"><div class="label">Publication Date</div><div class="val">__PUBDATE__</div></div>
    <div class="meta-box"><div class="label">DOI</div><div class="val">__DOI__</div></div>
    <div class="meta-box"><div class="label">License</div><div class="val">CC BY 4.0 &mdash; Open Access</div></div>
  </div>

  <div class="sigs">
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Alain Pangop Cyr</div><div class="sig-role">Editor-in-Chief, IJTD</div></div>
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Clautaire Mwebi Ekengoue</div><div class="sig-role">Co-Editor-in-Chief, IJTD</div></div>
  </div>

  <div class="seal"><div class="seal-text">IJTD<br>ASAIE<br>Certified<br>Publication</div></div>

  <div class="foot">
    Issued on __ISSUED__ &nbsp;&bull;&nbsp; www.ijtd.com &nbsp;&bull;&nbsp; contact@ijtd.com
  </div>
</div>
</body>
</html>"""


def _esc(text: str) -> str:
    return (str(text)
            .replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def _build_cert(ms, article):
    from datetime import datetime
    pub_date  = (article.published_at.strftime("%B %d, %Y")
                 if article and article.published_at else "In Press")
    doi       = (article.doi if article else "Pending") or "Pending"
    issued_on = datetime.now().strftime("%B %d, %Y")

    return (_CERT_HTML
            .replace("__TITLE__",   _esc(ms.title))
            .replace("__AUTHORS__", _esc(ms.authors))
            .replace("__MSNUM__",   _esc(ms.manuscript_number))
            .replace("__PUBDATE__", _esc(pub_date))
            .replace("__DOI__",     _esc(doi))
            .replace("__ISSUED__",  _esc(issued_on)))


def _find_manuscript(email: str, ms_num: str):
    q = Manuscript.query.filter(
        Manuscript.corresponding_email.ilike(email),
        Manuscript.status.in_(["accepted", "published"]),
    )
    if ms_num:
        q = q.filter(Manuscript.manuscript_number.ilike(ms_num))
    return q.order_by(Manuscript.submitted_at.desc()).first()


# ── Routes ─────────────────────────────────────────────────────────────────────

@certificate_bp.route("", methods=["GET"])
def get_certificate():
    """
    Get certificate metadata (used by the frontend preview)
    ---
    tags:
      - Certificate
    parameters:
      - name: email
        in: query
        type: string
        required: true
      - name: manuscript_number
        in: query
        type: string
        required: false
    responses:
      200:
        description: Certificate data
      404:
        description: No published manuscript found
    """
    email  = request.args.get("email", "").strip().lower()
    ms_num = request.args.get("manuscript_number", "").strip()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    ms = _find_manuscript(email, ms_num)
    if not ms:
        return jsonify({"error": "No published manuscript found for the provided details"}), 404

    article = Article.query.filter_by(title=ms.title, status="published").first()
    return jsonify({
        "manuscriptNumber": ms.manuscript_number,
        "title":            ms.title,
        "authors":          ms.authors,
        "publicationDate":  (article.published_at.strftime("%B %d, %Y")
                             if article and article.published_at else "In Press"),
        "doi":              (article.doi if article else "Pending") or "Pending",
        "journal":          "International Journal of Transformative Development",
    })


@certificate_bp.route("/download", methods=["GET"])
def download_certificate():
    """
    Open the publication certificate as a styled HTML page.
    Author can print or use File > Print > Save as PDF.
    ---
    tags:
      - Certificate
    parameters:
      - name: email
        in: query
        type: string
        required: true
      - name: manuscript_number
        in: query
        type: string
        required: false
    responses:
      200:
        description: HTML certificate page
      404:
        description: No published manuscript found
    """
    email  = request.args.get("email", "").strip().lower()
    ms_num = request.args.get("manuscript_number", "").strip()
    if not email:
        return jsonify({"error": "Email is required"}), 400

    ms = _find_manuscript(email, ms_num)
    if not ms:
        return jsonify({"error": "No published manuscript found for the provided details"}), 404

    article = Article.query.filter_by(title=ms.title, status="published").first()
    html    = _build_cert(ms, article)
    return Response(html, mimetype="text/html; charset=utf-8")