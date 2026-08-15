"""
utils/email_templates.py
All transactional email templates for IJTD.
Returns (subject, html_body) tuples.

NEW: payment_required_email — sent when editor sets status to accepted_pending_payment.
     Includes APC amounts and payment instructions.
"""
import os

FRONTEND = os.getenv("FRONTEND_URL", "http://localhost:3000")

_WRAP = """<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9fafb">
  <div style="background:#0B1E3D;padding:20px 24px;border-radius:8px 8px 0 0;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:18px">International Journal of Transformative Development</h1>
    <p style="color:#93c5fd;margin:4px 0 0;font-size:12px">IJTD — ASAIE Publishing, Yaoundé, Cameroon</p>
  </div>
  <div style="background:#fff;padding:28px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    {body}
  </div>
  <p style="text-align:center;color:#9ca3af;font-size:11px;margin-top:12px">
    © IJTD — contact@ijtd.com — www.ijtd.com
  </p>
</div>"""


def _wrap(body: str) -> str:
    return _WRAP.replace("{body}", body)


def _btn(text, url):
    return f'<div style="text-align:center;margin:20px 0"><a href="{url}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">{text}</a></div>'


def _info_box(lines: list) -> str:
    rows = "".join(f'<p style="margin:6px 0;font-size:13px;color:#1e40af"><strong>{k}:</strong> {v}</p>' for k, v in lines)
    return f'<div style="background:#eff6ff;border-left:4px solid #2563eb;padding:16px;border-radius:4px;margin:16px 0">{rows}</div>'


# ── Submission confirmation ────────────────────────────────────────────────────

def submission_confirmation_email(ms):
    subject = f"[IJTD] Manuscript Received — {ms.manuscript_number}"
    body    = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">Manuscript Received</h2>
<p style="color:#374151">Dear Author,</p>
<p style="color:#374151">Thank you for submitting your manuscript to IJTD. We have received your submission and it will undergo editorial review.</p>
{_info_box([
    ("Manuscript Number", ms.manuscript_number),
    ("Title", ms.title),
    ("Type", ms.manuscript_type),
])}
<p style="color:#374151">You will receive our editorial decision within <strong>2–3 weeks</strong>.</p>
{_btn("Track Your Submission", f"{FRONTEND}/track-manuscript")}
<p style="color:#6b7280;font-size:13px">Please keep your manuscript number for all future correspondence.</p>
""")
    return subject, body


# ── Decision email ────────────────────────────────────────────────────────────

def manuscript_decision_email(manuscript, status, reviewer_comments=""):
    labels = {
        "under_review":             ("Under Review",              "#2563eb", "Your manuscript is now under peer review. You will receive our decision within 2–3 weeks."),
        "revision_required":        ("Revision Required",         "#d97706", "After careful review, we request that you revise your manuscript based on the comments below and resubmit within <strong>3 weeks</strong>."),
        "accepted_pending_payment": ("Accepted — Payment Required","#16a34a","Congratulations! Your manuscript has been accepted for publication in IJTD pending receipt of the Article Processing Charge (APC). Please see payment instructions below."),
        "payment_received":         ("Payment Received",          "#0891b2", "Thank you — we have received your publication fee. The editorial team will now prepare the final formatted version of your article."),
        "ready_to_publish":         ("In Final Preparation",      "#7c3aed", "Your article is in final formatting and will be published shortly. You will receive a publication notification once it is live."),
        "rejected":                 ("Not Accepted",              "#dc2626", "After thorough review, we regret to inform you that your manuscript has not been accepted for publication in IJTD at this time. We appreciate your interest and encourage you to consider our feedback for future submissions."),
        "published":                ("Published",                 "#7c3aed", "Your article has been officially published in IJTD and is now available to readers worldwide."),
    }
    label, color, message = labels.get(status, (status.replace("_"," ").title(), "#374151", "Your manuscript status has been updated."))
    subject = f"[IJTD] Manuscript Decision: {label} — {manuscript.manuscript_number}"

    comments_section = ""
    if reviewer_comments:
        comments_section = f"""
<div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin:16px 0">
  <p style="margin:0 0 8px;font-weight:700;color:#92400e">Reviewer / Editorial Comments:</p>
  <p style="margin:0;color:#78350f;white-space:pre-wrap;font-size:14px">{reviewer_comments}</p>
</div>"""

    body = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">Manuscript Decision</h2>
<p style="color:#374151">Dear Author,</p>
{_info_box([("Manuscript", manuscript.manuscript_number), ("Title", manuscript.title)])}
<div style="border-left:4px solid {color};padding:12px 16px;background:#f9fafb;border-radius:4px;margin:16px 0">
  <p style="margin:0;font-weight:700;color:{color};font-size:16px">Status: {label}</p>
</div>
<p style="color:#374151">{message}</p>
{comments_section}
{_btn("Track Your Submission", f"{FRONTEND}/track-manuscript")}
<p style="color:#6b7280;font-size:13px">If you have questions, reply to this email or contact contact@ijtd.com</p>
""")
    return subject, body


# ── Payment Required email ────────────────────────────────────────────────────
# Sent separately (in addition to the decision email) when status = accepted_pending_payment
# so the payment instructions are prominent and not buried in a status update.

def payment_required_email(manuscript):
    """
    Dedicated payment instructions email sent when a manuscript is accepted
    pending the Article Processing Charge (APC).
    """
    subject = f"[IJTD] Action Required: Publication Fee — {manuscript.manuscript_number}"
    body = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">🎉 Manuscript Accepted — Payment Required</h2>
<p style="color:#374151">Dear Author,</p>
<p style="color:#374151">
  Congratulations! We are pleased to inform you that your manuscript has been accepted for publication
  in the <strong>International Journal of Transformative Development (IJTD)</strong>.
  To proceed with publication, please remit the Article Processing Charge (APC) as detailed below.
</p>

{_info_box([
    ("Manuscript Number", manuscript.manuscript_number),
    ("Title", manuscript.title),
    ("Authors", manuscript.authors),
])}

<div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:20px;margin:20px 0">
  <h3 style="color:#15803d;margin-top:0">Article Processing Charges (APC)</h3>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr style="background:#dcfce7">
      <th style="padding:10px;text-align:left;border:1px solid #86efac">Author Category</th>
      <th style="padding:10px;text-align:left;border:1px solid #86efac">Amount</th>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #86efac">Foreign Authors (outside Cameroon)</td>
      <td style="padding:10px;border:1px solid #86efac;font-weight:bold">120 USD</td>
    </tr>
    <tr style="background:#f0fdf4">
      <td style="padding:10px;border:1px solid #86efac">Authors in Cameroon</td>
      <td style="padding:10px;border:1px solid #86efac;font-weight:bold">60,000 FCFA</td>
    </tr>
  </table>
</div>

<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:20px 0">
  <h3 style="color:#1d4ed8;margin-top:0">Payment Methods</h3>
  <p style="color:#374151;font-size:13px;margin-bottom:8px"><strong>For Foreign Authors (USD):</strong></p>
  <ul style="color:#374151;font-size:13px;margin:0 0 16px 16px">
    <li>PayPal — send to: <strong>contact@ijtd.com</strong></li>
    <li>Any transaction fees are borne by the author</li>
  </ul>
  <p style="color:#374151;font-size:13px;margin-bottom:8px"><strong>For Authors in Cameroon (FCFA):</strong></p>
  <ul style="color:#374151;font-size:13px;margin:0 0 0 16px">
    <li>MTN Mobile Money: <strong>+237 6XX XXX XXX</strong> — Name: ASAIE Publishing</li>
    <li>Orange Money: <strong>+237 6XX XXX XXX</strong> — Name: ASAIE Publishing</li>
    <li>Bank Transfer: Contact us at contact@ijtd.com for account details</li>
  </ul>
</div>

<div style="background:#fff7ed;border-left:4px solid #f59e0b;padding:16px;border-radius:4px;margin:16px 0">
  <p style="margin:0;font-size:13px;color:#92400e">
    <strong>Important:</strong> Please send proof of payment (screenshot or receipt) to
    <a href="mailto:contact@ijtd.com" style="color:#2563eb">contact@ijtd.com</a>
    quoting your manuscript number <strong>{manuscript.manuscript_number}</strong>.
    No charges apply for rejected manuscripts. Corrections are free within 3 days of online publication.
  </p>
</div>

{_btn("Track Your Submission", f"{FRONTEND}/track-manuscript")}
<p style="color:#6b7280;font-size:13px">
  Once payment is confirmed, our editorial team will prepare and format the final version of your article
  for publication. If you have any questions, contact us at contact@ijtd.com.
</p>
""")
    return subject, body


# ── Review invitation ─────────────────────────────────────────────────────────

def review_invitation_email(manuscript, reviewer):
    subject = f"[IJTD] Review Invitation — {manuscript.manuscript_number}"
    body    = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">Peer Review Invitation</h2>
<p style="color:#374151">Dear {reviewer.full_name},</p>
<p style="color:#374151">You have been invited to review the following manuscript submitted to IJTD:</p>
{_info_box([
    ("Manuscript #", manuscript.manuscript_number),
    ("Title", manuscript.title),
    ("Type", manuscript.manuscript_type),
    ("Corresponding Author", manuscript.corresponding_email),
])}
<p style="color:#374151">Please log in to the IJTD reviewer portal to access the manuscript file and submit your review recommendation.</p>
{_btn("Go to Review Portal", f"{FRONTEND}/admin/manuscripts")}
<p style="color:#6b7280;font-size:13px">We appreciate your valuable contribution to the peer-review process. Please complete your review within <strong>2 weeks</strong>. The manuscript file (.doc/.docx) can be downloaded from the portal.</p>
""")
    return subject, body


# ── Application decision ──────────────────────────────────────────────────────

def application_decision_email(application, new_status):
    if new_status == "approved":
        outcome = "approved"
        msg     = "We are pleased to inform you that your application has been <strong>approved</strong>. Welcome to the IJTD community! Our editorial office will contact you with further details."
        color   = "#16a34a"
    else:
        outcome = "not approved at this time"
        msg     = "After careful review, we regret that we are unable to approve your application at this time. We encourage you to apply again in the future."
        color   = "#dc2626"

    subject = f"[IJTD] {application.application_type.title()} Application — {outcome.title()}"
    body    = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">Application Update</h2>
<p style="color:#374151">Dear {application.full_name},</p>
<p style="color:#374151">Thank you for your interest in joining IJTD as a <strong>{application.application_type}</strong>.</p>
<div style="border-left:4px solid {color};padding:12px 16px;background:#f9fafb;border-radius:4px;margin:16px 0">
  <p style="margin:0;font-weight:700;color:{color}">Application Status: {outcome.title()}</p>
</div>
<p style="color:#374151">{msg}</p>
<p style="color:#6b7280;font-size:13px">If you have questions, contact contact@ijtd.com</p>
""")
    return subject, body


# ── Contact auto-reply ────────────────────────────────────────────────────────

def contact_autoreply_email(name, subject_line):
    subject = f"[IJTD] We received your message — {subject_line}"
    body    = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">Message Received</h2>
<p style="color:#374151">Dear {name},</p>
<p style="color:#374151">Thank you for contacting IJTD. We have received your message regarding "<strong>{subject_line}</strong>".</p>
<p style="color:#374151">Our editorial team will review your message and respond within <strong>2 business days</strong>.</p>
<p style="color:#6b7280;font-size:13px">For urgent matters, contact us directly at contact@ijtd.com</p>
""")
    return subject, body


# ── Publication notification ──────────────────────────────────────────────────

def publication_notification_email(ms, article):
    doi_line = f"https://doi.org/{article.doi}" if article.doi else "Assigned upon indexing"
    subject  = f"[IJTD] Your Article Has Been Published — {ms.manuscript_number}"
    body     = _wrap(f"""
<h2 style="color:#0B1E3D;margin-top:0">🎉 Your Article is Published!</h2>
<p style="color:#374151">Dear Author,</p>
<p style="color:#374151">Congratulations! Your article has been officially published in IJTD and is now freely accessible worldwide.</p>
{_info_box([
    ("Title", article.title),
    ("Authors", article.authors),
    ("DOI", doi_line),
    ("Published", article.published_at.strftime("%B %d, %Y") if article.published_at else "Today"),
])}
{_btn("View Your Published Article", f"{FRONTEND}/article/{article.id}")}
<p style="color:#374151">You can download your <strong>free Certificate of Publication</strong> at:</p>
{_btn("Download Certificate", f"{FRONTEND}/get-certificate")}
<p style="color:#6b7280;font-size:13px">Thank you for choosing IJTD for your research publication.</p>
""")
    return subject, body