"""
app/routes/manuscripts.py
FIXED: Author email now sends correctly with full error visibility.

ROOT CAUSE OF ORIGINAL BUG:
  The send_author_confirmation function was catching ALL exceptions and
  logging them as warnings, making it impossible to see what was failing.
  Also, Gmail treats the sender name as suspicious when it does not match
  the FROM address, causing external emails to land in spam.

FIXES APPLIED:
  1. Added explicit sender name "IJTD Editorial Office <journalijtd@gmail.com>"
     so Gmail does not flag it as suspicious.
  2. Added Reply-To header so author replies go to the editorial address.
  3. Removed emoji from subject lines (some mail servers reject them).
  4. Full error printing to terminal so you can see exactly what fails.
  5. Added /debug-email endpoint to test author email without submitting
     a real manuscript.
  6. The author email is now sent BEFORE the admin email so if there is
     a failure you see it first.
"""
import os
import uuid
import logging
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
# Core email helper
# ─────────────────────────────────────────────────────────
def _send_email(subject, html, recipients, reply_to=None):
    """
    Send an HTML email via Flask-Mail.
    Prints the EXACT error to the Flask terminal if sending fails.
    Returns True on success, False on failure.
    """
    username = current_app.config.get("MAIL_USERNAME", "").strip()
    password = current_app.config.get("MAIL_PASSWORD", "").strip()

    if not username or not password:
        print(
            f"[IJTD EMAIL] SKIPPED — MAIL_USERNAME or MAIL_PASSWORD not set.\n"
            f"  MAIL_USERNAME: '{username}'\n"
            f"  MAIL_PASSWORD: '{'SET' if password else 'EMPTY'}'\n"
            f"  Intended recipients: {recipients}"
        )
        return False

    # Use a friendly sender name — this prevents Gmail spam filters
    # from flagging emails sent to external (non-Gmail) addresses.
    sender = f"IJTD Editorial Office <{username}>"

    try:
        msg = Message(
            subject    = subject,
            recipients = recipients,
            html       = html,
            sender     = sender,
        )
        # Add Reply-To so author replies come back to the editorial inbox
        if reply_to:
            msg.reply_to = reply_to

        mail.send(msg)
        print(f"[IJTD EMAIL] OK — sent to {recipients} | subject: {subject}")
        logger.info(f"Email sent to {recipients}: {subject}")
        return True

    except Exception as exc:
        # Print the FULL error — not just a warning — so you can debug
        print(
            f"\n[IJTD EMAIL] FAILED\n"
            f"  To      : {recipients}\n"
            f"  Subject : {subject}\n"
            f"  Sender  : {sender}\n"
            f"  Error   : {type(exc).__name__}: {exc}\n"
            f"  Hint    : If '534' or 'credentials' → regenerate Gmail App Password.\n"
            f"            If 'recipient' → the author email address is invalid.\n"
            f"            If email sends OK but not received → check author SPAM folder.\n"
        )
        logger.error(f"Email FAILED to {recipients}: {type(exc).__name__}: {exc}")
        return False


# ─────────────────────────────────────────────────────────
# Author confirmation email
# ─────────────────────────────────────────────────────────
def send_author_confirmation(ms):
    """Send submission confirmation to the corresponding author."""
    frontend       = os.getenv("FRONTEND_URL", "http://localhost:3000")
    editorial_email = os.getenv("ADMIN_EMAIL", "") or current_app.config.get("MAIL_USERNAME", "")

    # No emoji in subject — some mail servers reject them
    subject = f"[IJTD] Manuscript Received - {ms.manuscript_number}"

    html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
            padding:0;background:#f9fafb;">

  <!-- Header -->
  <div style="background:#0B1E3D;padding:24px 28px;
              border-radius:8px 8px 0 0;text-align:center;">
    <h1 style="color:#ffffff;margin:0;font-size:18px;font-weight:bold;">
      International Journal of Transformative Development
    </h1>
    <p style="color:#93c5fd;margin:6px 0 0;font-size:12px;">
      IJTD - ASAIE Publishing, Yaounde, Cameroon
    </p>
  </div>

  <!-- Body -->
  <div style="background:#ffffff;padding:28px 32px;
              border:1px solid #e5e7eb;border-top:none;
              border-radius:0 0 8px 8px;">

    <h2 style="color:#0B1E3D;margin-top:0;">Manuscript Received</h2>
    <p style="color:#374151;line-height:1.6;">Dear Author,</p>
    <p style="color:#374151;line-height:1.6;">
      Thank you for submitting your manuscript to the International Journal of
      Transformative Development (IJTD). We have received your Word document
      and it is now awaiting editorial assignment.
    </p>

    <!-- Info box -->
    <div style="background:#eff6ff;border-left:4px solid #2563eb;
                padding:16px 20px;border-radius:4px;margin:20px 0;">
      <p style="margin:0 0 8px 0;font-size:13px;color:#1e40af;">
        <strong>Manuscript Number:</strong>
        <span style="font-family:monospace;font-size:15px;
                     color:#1d4ed8;"> {ms.manuscript_number}</span>
      </p>
      <p style="margin:0 0 8px 0;font-size:13px;color:#1e40af;">
        <strong>Title:</strong> {ms.title}
      </p>
      <p style="margin:0 0 8px 0;font-size:13px;color:#1e40af;">
        <strong>Type:</strong> {ms.manuscript_type}
      </p>
      <p style="margin:0;font-size:13px;color:#1e40af;">
        <strong>Submitted:</strong>
        {ms.submitted_at.strftime('%B %d, %Y') if ms.submitted_at else 'Today'}
      </p>
    </div>

    <p style="color:#374151;line-height:1.6;">
      Please save your manuscript number. You will need it to track your
      submission and for all correspondence with the editorial office.
    </p>

    <h3 style="color:#0B1E3D;">What happens next?</h3>
    <ol style="color:#374151;line-height:2;">
      <li>The editor reviews your submission and assigns a peer reviewer.</li>
      <li>The reviewer evaluates your manuscript (2-3 weeks).</li>
      <li>If accepted, you will receive payment instructions for the
          Article Processing Charge (APC).</li>
      <li>After payment the editorial team formats and publishes your article.</li>
    </ol>

    <!-- Track button -->
    <div style="text-align:center;margin:28px 0;">
      <a href="{frontend}/track-manuscript"
         style="background:#2563eb;color:#ffffff;padding:13px 32px;
                border-radius:8px;text-decoration:none;font-weight:600;
                display:inline-block;font-size:14px;">
        Track My Submission
      </a>
    </div>

    <p style="color:#6b7280;font-size:13px;line-height:1.6;">
      If you have any questions please reply to this email or contact us at
      <a href="mailto:{editorial_email}" style="color:#2563eb;">
        {editorial_email}
      </a>
    </p>
  </div>

  <!-- Footer -->
  <p style="text-align:center;color:#9ca3af;font-size:11px;
            margin-top:12px;padding-bottom:16px;">
    IJTD Editorial Office - Yaounde, Cameroon |
    <a href="mailto:{editorial_email}"
       style="color:#9ca3af;">{editorial_email}</a>
  </p>
</div>"""

    return _send_email(
        subject    = subject,
        html       = html,
        recipients = [ms.corresponding_email],
        reply_to   = editorial_email,
    )


# ─────────────────────────────────────────────────────────
# Admin notification email
# ─────────────────────────────────────────────────────────
def send_admin_notification(ms):
    """Send new submission alert to the editorial office."""
    admin_email = os.getenv("ADMIN_EMAIL", "").strip()
    if not admin_email:
        admin_email = current_app.config.get("MAIL_USERNAME", "").strip()
    if not admin_email:
        print("[IJTD EMAIL] Admin notification skipped: ADMIN_EMAIL not set in .env")
        return False

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    subject  = f"[IJTD] New Submission - {ms.manuscript_number}"

    html = f"""
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
            padding:0;background:#fffbeb;">
  <div style="background:#92400e;padding:18px 24px;
              border-radius:8px 8px 0 0;text-align:center;">
    <h2 style="color:#ffffff;margin:0;font-size:16px;">
      New Manuscript Submission
    </h2>
    <p style="color:#fde68a;margin:4px 0 0;font-size:12px;">
      IJTD Editorial Dashboard
    </p>
  </div>
  <div style="background:#ffffff;padding:24px 28px;
              border:1px solid #fde68a;border-top:none;
              border-radius:0 0 8px 8px;">
    <p style="color:#374151;">A new manuscript requires editorial assignment.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="background:#fffbeb;">
        <td style="padding:8px 12px;font-weight:bold;
                   border:1px solid #fde68a;width:38%;">Manuscript Number</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;
                   font-family:monospace;color:#92400e;">
          {ms.manuscript_number}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;
                   border:1px solid #fde68a;">Type</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;">
          {ms.manuscript_type}
        </td>
      </tr>
      <tr style="background:#fffbeb;">
        <td style="padding:8px 12px;font-weight:bold;
                   border:1px solid #fde68a;">Title</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;">
          {ms.title}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;
                   border:1px solid #fde68a;">Authors</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;">
          {ms.authors}
        </td>
      </tr>
      <tr style="background:#fffbeb;">
        <td style="padding:8px 12px;font-weight:bold;
                   border:1px solid #fde68a;">Corresponding Email</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;">
          {ms.corresponding_email}
        </td>
      </tr>
      <tr>
        <td style="padding:8px 12px;font-weight:bold;
                   border:1px solid #fde68a;">Submitted</td>
        <td style="padding:8px 12px;border:1px solid #fde68a;">
          {ms.submitted_at.strftime('%B %d, %Y %H:%M UTC') if ms.submitted_at else 'Now'}
        </td>
      </tr>
    </table>
    <div style="text-align:center;margin:20px 0;">
      <a href="{frontend}/admin/manuscripts"
         style="background:#92400e;color:#ffffff;padding:12px 28px;
                border-radius:8px;text-decoration:none;font-weight:600;
                display:inline-block;">
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

    data    = request.form
    missing = [f for f in
               ["manuscriptType","title","abstract","keywords","authors","email"]
               if not data.get(f, "").strip()]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # File validation — Word only
    if "file" not in request.files:
        return jsonify({
            "error": "A Word document (.doc or .docx) is required."
        }), 400

    f = request.files["file"]
    if not f or not f.filename:
        return jsonify({"error": "Empty file upload."}), 400

    if not allowed_file(f.filename):
        ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else "unknown"
        return jsonify({
            "error": (
                f"File type .{ext} is not accepted. "
                "IJTD requires Word documents (.doc or .docx) only. "
                "Do not submit a PDF — the editorial team produces the "
                "formatted PDF after acceptance."
            )
        }), 400

    folder = current_app.config.get("UPLOAD_FOLDER", "uploads")
    os.makedirs(folder, exist_ok=True)
    unique_fn = f"{uuid.uuid4().hex}_{secure_filename(f.filename)}"
    f.save(os.path.join(folder, unique_fn))

    # Clean the author email — remove invisible whitespace
    author_email = data["email"].strip().lower()

    ms = Manuscript(
        manuscript_number   = generate_manuscript_number(),
        manuscript_type     = data["manuscriptType"].strip(),
        title               = data["title"].strip(),
        abstract            = data["abstract"].strip(),
        keywords            = data["keywords"].strip(),
        authors             = data["authors"].strip(),
        corresponding_email = author_email,
        file_path           = unique_fn,
        status              = "submitted",
    )
    db.session.add(ms)
    db.session.commit()

    print(f"[IJTD] Submission saved: {ms.manuscript_number} → {ms.corresponding_email}")

    # Author email sent FIRST so you see its result immediately in terminal
    author_ok = send_author_confirmation(ms)
    admin_ok  = send_admin_notification(ms)

    if not author_ok:
        print(
            f"[IJTD] WARNING: Author confirmation NOT sent for "
            f"{ms.manuscript_number} to {ms.corresponding_email}\n"
            f"  → Check author's SPAM folder first.\n"
            f"  → Check terminal above for the exact SMTP error."
        )

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


# ─────────────────────────────────────────────────────────
# DEBUG ENDPOINT — remove before final production launch
# ─────────────────────────────────────────────────────────
@manuscripts_bp.route("/debug-email", methods=["GET"])
def debug_author_email():
    """
    Test sending an author-style email to any address.
    Use this to verify that external (non-Gmail) addresses receive emails.

    Usage:
      GET /api/manuscripts/debug-email?to=authoraddress@example.com

    Watch your Flask terminal for the result.
    """
    to = request.args.get("to", "").strip()
    if not to:
        return jsonify({"error": "Provide ?to=email@example.com"}), 400

    frontend = os.getenv("FRONTEND_URL", "http://localhost:3000")
    username = current_app.config.get("MAIL_USERNAME", "")

    ok = _send_email(
        subject    = "[IJTD] Email delivery test",
        html       = f"""
<div style="font-family:Arial,sans-serif;max-width:500px;padding:24px;
            background:#f0fdf4;border-radius:8px;">
  <h2 style="color:#15803d;">IJTD Email Test</h2>
  <p>This is a delivery test from the IJTD journal platform.</p>
  <p>If you received this email, author notifications are working correctly
     for your email address.</p>
  <p><strong>Sent from:</strong> {username}</p>
  <p><strong>Sent to:</strong> {to}</p>
  <p><strong>Frontend URL:</strong> {frontend}</p>
</div>""",
        recipients = [to],
        reply_to   = username,
    )

    if ok:
        return jsonify({
            "message": f"Test email sent to {to}. Check inbox AND spam folder.",
            "sender":  username,
        })
    return jsonify({
        "error": (
            "Email failed. Check your Flask terminal for the exact error. "
            "Common fix: check author SPAM folder or regenerate Gmail App Password."
        )
    }), 500
