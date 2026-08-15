"""
app/routes/admin.py — complete admin blueprint with proper role-based workflow

WORKFLOW FIXES:
─────────────────────────────────────────────────────────────────────────────
REVIEWER:
  • list_manuscripts / get_manuscript → ONLY manuscripts assigned to them
  • update_manuscript_status → can only set: revision_required,
    accepted_pending_payment, rejected   (their review verdict)
  • Cannot assign reviewers, upload PDFs, publish, manage users

EDITOR:
  • list_manuscripts / get_manuscript → ALL manuscripts
  • update_manuscript_status → can set most statuses (not ready_to_publish
    or published — those are triggered by upload & admin-publish actions)
  • assign_reviewer → yes
  • upload_formatted_pdf → yes (sets status to ready_to_publish)
  • publish_manuscript → NO (admin only)
  • manage users → NO (admin only)

ADMIN:
  • Full access to everything including publish and user management

STATUS FLOW:
  submitted → under_review → revision_required | accepted_pending_payment | rejected
  accepted_pending_payment → payment_received → (editor uploads PDF) → ready_to_publish
  ready_to_publish → published  (admin only, via publish endpoint)

EMAIL TRIGGERS:
  • accepted_pending_payment → payment_required_email + manuscript_decision_email
  • any other status change → manuscript_decision_email (if send_email=True)
  • assign_reviewer → review_invitation_email
  • publish → publication_notification_email
  • application decision → application_decision_email
─────────────────────────────────────────────────────────────────────────────
"""
import os
import uuid
import sys

_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _root not in sys.path:
    sys.path.insert(0, _root)

from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity
from werkzeug.utils import secure_filename
from app import db, mail
from app.models import User, Role, Manuscript, Article, Issue, Volume, JoinApplication, ContactMessage
from auth import admin_required, editor_required, reviewer_required
from utils.email_templates import (
    manuscript_decision_email, review_invitation_email,
    application_decision_email, publication_notification_email,
    payment_required_email,
)
from flask_mail import Message

admin_bp = Blueprint("admin", __name__)


def _send(subject, html, recipients):
    """Send HTML email — log warning if mail not configured."""
    import logging
    try:
        mail.send(Message(subject=subject, recipients=recipients, html=html))
    except Exception as e:
        logging.getLogger(__name__).warning(f"Email not sent: {e}")


def _current_user():
    """Return the User object for the current JWT identity."""
    user_id = int(get_jwt_identity())
    return User.query.get(user_id)


# ── Status permission map ──────────────────────────────────────────────────────
# Defines which statuses each role is allowed to SET via update_manuscript_status.
# The "ready_to_publish" status is set automatically by upload_formatted_pdf.
# The "published" status is set only by the publish_manuscript endpoint (admin only).

REVIEWER_CAN_SET = {"revision_required", "accepted_pending_payment", "rejected"}
EDITOR_CAN_SET   = {
    "submitted", "under_review", "revision_required",
    "accepted_pending_payment", "payment_received", "rejected",
}
ADMIN_CAN_SET    = {
    "submitted", "under_review", "revision_required",
    "accepted_pending_payment", "payment_received",
    "ready_to_publish", "published", "rejected",
}

ALL_VALID_STATUSES = list(ADMIN_CAN_SET)


# ── Stats ──────────────────────────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@editor_required
def get_stats():
    try:
        return jsonify({
            "manuscripts": {
                "total":                 Manuscript.query.count(),
                "submitted":             Manuscript.query.filter_by(status="submitted").count(),
                "under_review":          Manuscript.query.filter_by(status="under_review").count(),
                "revision_required":     Manuscript.query.filter_by(status="revision_required").count(),
                "accepted_pending_payment": Manuscript.query.filter_by(status="accepted_pending_payment").count(),
                "payment_received":      Manuscript.query.filter_by(status="payment_received").count(),
                "ready_to_publish":      Manuscript.query.filter_by(status="ready_to_publish").count(),
                "published":             Manuscript.query.filter_by(status="published").count(),
                "rejected":              Manuscript.query.filter_by(status="rejected").count(),
            },
            "articles":     {"published": Article.query.filter_by(status="published").count()},
            "users":        {"total": User.query.count()},
            "applications": {
                "pending":  JoinApplication.query.filter_by(status="pending").count(),
                "approved": JoinApplication.query.filter_by(status="approved").count(),
                "rejected": JoinApplication.query.filter_by(status="rejected").count(),
                "total":    JoinApplication.query.count(),
            },
            "messages": {"unread": ContactMessage.query.filter_by(is_read=False).count()},
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Manuscripts ────────────────────────────────────────────────────────────────

@admin_bp.route("/manuscripts", methods=["GET"])
@reviewer_required
def list_manuscripts():
    """
    List manuscripts.
    REVIEWER → only manuscripts assigned to them.
    EDITOR / ADMIN → all manuscripts, with optional status filter.
    """
    user = _current_user()
    status   = request.args.get("status")
    page     = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    q = Manuscript.query

    # Reviewer scope: only their assigned manuscripts
    if user.role.name == "reviewer":
        q = q.filter_by(assigned_reviewer_id=user.id)

    if status:
        q = q.filter_by(status=status)

    p = q.order_by(Manuscript.submitted_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    return jsonify({
        "manuscripts":   [m.to_dict() for m in p.items],
        "total":         p.total,
        "pages":         p.pages,
        "current_page":  page,
    })


@admin_bp.route("/manuscripts/<int:ms_id>", methods=["GET"])
@reviewer_required
def get_manuscript(ms_id):
    """
    Get single manuscript.
    REVIEWER → 403 if not their assigned manuscript.
    """
    user = _current_user()
    ms   = Manuscript.query.get_or_404(ms_id)

    if user.role.name == "reviewer" and ms.assigned_reviewer_id != user.id:
        return jsonify({"error": "You can only view manuscripts assigned to you."}), 403

    return jsonify(ms.to_dict())


@admin_bp.route("/manuscripts/<int:ms_id>/status", methods=["PUT"])
@reviewer_required
def update_manuscript_status(ms_id):
    """
    Update manuscript status with role-based restrictions.

    Reviewer → can only set: revision_required, accepted_pending_payment, rejected
               and only for their own assigned manuscripts.
    Editor   → can set most statuses (not ready_to_publish / published).
    Admin    → can set any status.

    When status becomes accepted_pending_payment:
      • Sends payment_required_email (dedicated APC instructions)
      • Sends manuscript_decision_email (standard decision notice)
    """
    user       = _current_user()
    ms         = Manuscript.query.get_or_404(ms_id)
    data       = request.get_json(silent=True) or {}
    new_status = data.get("status")
    comments   = data.get("reviewer_comments", "")
    do_email   = data.get("send_email", True)

    # Reviewer: only their assigned manuscripts
    if user.role.name == "reviewer" and ms.assigned_reviewer_id != user.id:
        return jsonify({"error": "You can only update manuscripts assigned to you."}), 403

    # Validate status value
    if new_status not in ALL_VALID_STATUSES:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(ALL_VALID_STATUSES)}"}), 400

    # Role-based status permission check
    allowed = (
        REVIEWER_CAN_SET if user.role.name == "reviewer"
        else EDITOR_CAN_SET   if user.role.name == "editor"
        else ADMIN_CAN_SET
    )
    if new_status not in allowed:
        return jsonify({
            "error": f"Your role ({user.role.name}) cannot set status to '{new_status}'. "
                     f"Allowed statuses: {', '.join(sorted(allowed))}"
        }), 403

    ms.status = new_status
    if comments:
        ms.reviewer_comments = comments
    db.session.commit()

    if do_email:
        # Payment required: send TWO emails — the generic decision + dedicated APC email
        if new_status == "accepted_pending_payment":
            subject, html = payment_required_email(ms)
            _send(subject, html, [ms.corresponding_email])
        else:
            subject, html = manuscript_decision_email(ms, new_status, comments)
            _send(subject, html, [ms.corresponding_email])

    return jsonify({"message": "Status updated", "manuscript": ms.to_dict()})


@admin_bp.route("/manuscripts/<int:ms_id>/assign-reviewer", methods=["PUT"])
@editor_required
def assign_reviewer(ms_id):
    """
    Assign a reviewer to a manuscript and move it to under_review.
    Sends an invitation email to the assigned reviewer.
    EDITOR and ADMIN only.
    """
    ms          = Manuscript.query.get_or_404(ms_id)
    data        = request.get_json(silent=True) or {}
    reviewer_id = data.get("reviewer_id")
    reviewer    = User.query.get(reviewer_id)

    if not reviewer or reviewer.role.name not in ("reviewer", "editor", "admin"):
        return jsonify({"error": "Invalid reviewer: user not found or has wrong role"}), 400

    ms.assigned_reviewer_id = reviewer_id
    if ms.status == "submitted":
        ms.status = "under_review"
    db.session.commit()

    subject, html = review_invitation_email(ms, reviewer)
    _send(subject, html, [reviewer.email])

    return jsonify({"message": "Reviewer assigned", "manuscript": ms.to_dict()})


@admin_bp.route("/manuscripts/<int:ms_id>/upload-formatted", methods=["POST"])
@editor_required
def upload_formatted_pdf(ms_id):
    """
    Editor uploads the formatted PDF of an accepted, paid manuscript.

    Workflow:
      1. Manuscript must have status payment_received.
      2. Editor has formatted the author's Word file using the IJTD template externally.
      3. Editor converts to PDF and uploads it here.
      4. System saves the PDF and sets status → ready_to_publish.
      5. Admin can then publish it.

    Accepts multipart/form-data with a 'file' field (PDF only).
    """
    ms = Manuscript.query.get_or_404(ms_id)

    if ms.status != "payment_received":
        return jsonify({
            "error": (
                f"Only manuscripts with status 'payment_received' can receive a formatted PDF. "
                f"Current status: {ms.status}"
            )
        }), 400

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Include a PDF file in the 'file' field."}), 400

    f = request.files["file"]
    if not f or not f.filename:
        return jsonify({"error": "Empty file upload."}), 400

    ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""
    if ext != "pdf":
        return jsonify({"error": "Only PDF files are accepted for formatted versions."}), 400

    # Save the formatted PDF
    folder      = current_app.config["UPLOAD_FOLDER"]
    unique_name = f"formatted_{uuid.uuid4().hex}_{secure_filename(f.filename)}"
    f.save(os.path.join(folder, unique_name))

    ms.formatted_pdf_path = unique_name
    ms.status             = "ready_to_publish"
    db.session.commit()

    current_app.logger.info(
        f"Formatted PDF uploaded for {ms.manuscript_number}: {unique_name}"
    )
    return jsonify({
        "message":             "Formatted PDF uploaded. Manuscript is now ready for admin to publish.",
        "formatted_pdf_path":  unique_name,
        "manuscript":          ms.to_dict(),
    })


@admin_bp.route("/manuscripts/<int:ms_id>/publish", methods=["POST"])
@admin_required
def publish_manuscript(ms_id):
    """
    ADMIN ONLY — Publish a manuscript that the editor has formatted.

    Requirements:
      • Manuscript status must be ready_to_publish
      • A formatted PDF (formatted_pdf_path) must exist
      • An issue_id must be provided

    On success:
      • Creates an Article record with the formatted PDF as pdf_url
      • Sets manuscript status to published
      • Sends publication notification email to author
    """
    ms   = Manuscript.query.get_or_404(ms_id)
    data = request.get_json(silent=True) or {}

    if ms.status != "ready_to_publish":
        return jsonify({
            "error": (
                f"Only manuscripts with status 'ready_to_publish' can be published. "
                f"Current status: {ms.status}. "
                f"The editor must upload a formatted PDF first."
            )
        }), 400

    if not ms.formatted_pdf_path:
        return jsonify({
            "error": "No formatted PDF found. The editor must upload the formatted PDF before publishing."
        }), 400

    issue_id = data.get("issue_id")
    if not issue_id:
        return jsonify({"error": "issue_id is required to assign the article to an issue."}), 400

    doi      = data.get("doi", ms.manuscript_number)
    category = data.get("category", ms.manuscript_type or "Research Article")

    from datetime import datetime, timezone
    article = Article(
        issue_id=issue_id,
        title=ms.title,
        abstract=ms.abstract,
        keywords=ms.keywords,
        authors=ms.authors,
        category=category,
        doi=doi,
        # Use the editor's formatted PDF, not the author's original Word file
        pdf_url=ms.formatted_pdf_path,
        status="published",
        published_at=datetime.now(timezone.utc),
    )
    db.session.add(article)
    ms.status = "published"
    db.session.commit()

    subject, html = publication_notification_email(ms, article)
    _send(subject, html, [ms.corresponding_email])

    return jsonify({"message": "Article published successfully.", "article_id": article.id}), 201


# ── Users (ADMIN ONLY) ─────────────────────────────────────────────────────────

@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    role_filter = request.args.get("role")
    q = User.query
    if role_filter:
        q = q.join(Role).filter(Role.name == role_filter)
    return jsonify([u.to_dict() for u in q.order_by(User.created_at.desc()).all()])


@admin_bp.route("/users", methods=["POST"])
@admin_required
def create_user():
    data    = request.get_json(silent=True) or {}
    missing = [f for f in ["email","full_name","password","role"] if not data.get(f,"").strip()]
    if missing:
        return jsonify({"error": f"Missing: {', '.join(missing)}"}), 400
    if User.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"error": "Email already in use"}), 409
    role = Role.query.filter_by(name=data["role"]).first()
    if not role:
        return jsonify({"error": f"Invalid role: {data['role']}"}), 400
    user = User(
        email=data["email"].strip().lower(),
        full_name=data["full_name"].strip(),
        role_id=role.id,
        institution=data.get("institution", ""),
        country=data.get("country", ""),
        is_active=True,
    )
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@admin_bp.route("/users/<int:user_id>", methods=["PUT"])
@admin_required
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json(silent=True) or {}
    if "full_name"   in data: user.full_name   = data["full_name"].strip()
    if "institution" in data: user.institution = data["institution"]
    if "country"     in data: user.country     = data["country"]
    if "is_active"   in data: user.is_active   = bool(data["is_active"])
    if "role" in data:
        role = Role.query.filter_by(name=data["role"]).first()
        if not role: return jsonify({"error": "Invalid role"}), 400
        user.role_id = role.id
    if data.get("password"):
        if len(data["password"]) < 8:
            return jsonify({"error": "Password min 8 chars"}), 400
        user.set_password(data["password"])
    db.session.commit()
    return jsonify(user.to_dict())


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = False
    db.session.commit()
    return jsonify({"message": "User deactivated"})


# ── Issues ─────────────────────────────────────────────────────────────────────

@admin_bp.route("/issues", methods=["GET"])
@editor_required
def list_issues():
    issues = Issue.query.join(Volume).order_by(Volume.number.desc(), Issue.number.desc()).all()
    result = []
    for issue in issues:
        d = issue.to_dict()
        d["volume_number"] = issue.volume.number
        d["volume_year"]   = issue.volume.year
        d["article_count"] = Article.query.filter_by(issue_id=issue.id, status="published").count()
        result.append(d)
    return jsonify(result)


@admin_bp.route("/issues/<int:issue_id>/articles", methods=["GET"])
@editor_required
def issue_articles(issue_id):
    articles = Article.query.filter_by(issue_id=issue_id).order_by(Article.published_at.desc()).all()
    return jsonify([a.to_dict(detail=True) for a in articles])


# ── Applications ───────────────────────────────────────────────────────────────

@admin_bp.route("/applications", methods=["GET"])
@editor_required
def list_applications():
    status = request.args.get("status", "pending")
    q = JoinApplication.query
    if status != "all":
        q = q.filter_by(status=status)
    return jsonify([a.to_dict() for a in q.order_by(JoinApplication.submitted_at.desc()).all()])


@admin_bp.route("/applications/<int:app_id>/status", methods=["PUT"])
@editor_required
def update_application(app_id):
    app_record = JoinApplication.query.get_or_404(app_id)
    data       = request.get_json(silent=True) or {}
    new_status = data.get("status")
    if new_status not in ("approved", "rejected"):
        return jsonify({"error": "Status must be 'approved' or 'rejected'"}), 400
    app_record.status = new_status
    db.session.commit()
    subject, html = application_decision_email(app_record, new_status)
    _send(subject, html, [app_record.email])
    return jsonify({"message": f"Application {new_status}", "application": app_record.to_dict()})


# ── Messages ───────────────────────────────────────────────────────────────────

@admin_bp.route("/messages", methods=["GET"])
@editor_required
def list_messages():
    unread = request.args.get("unread") == "true"
    q = ContactMessage.query
    if unread:
        q = q.filter_by(is_read=False)
    return jsonify([m.to_dict() for m in q.order_by(ContactMessage.created_at.desc()).all()])


@admin_bp.route("/messages/<int:msg_id>/read", methods=["PUT"])
@editor_required
def mark_read(msg_id):
    msg = ContactMessage.query.get_or_404(msg_id)
    msg.is_read = True
    db.session.commit()
    return jsonify({"message": "Marked as read"})


# ── Reviewers dropdown ─────────────────────────────────────────────────────────

@admin_bp.route("/reviewers", methods=["GET"])
@editor_required
def list_reviewers():
    """
    List users eligible to be assigned as reviewers.
    EDITOR and ADMIN only (reviewer cannot assign manuscripts to others).
    """
    reviewers = (
        User.query.join(Role)
        .filter(Role.name.in_(["reviewer", "editor", "admin"]), User.is_active == True)
        .order_by(User.full_name.asc())
        .all()
    )
    return jsonify([u.to_dict() for u in reviewers])