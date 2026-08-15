"""
IJTD — Database Models (complete with User/Role)

KEY FIXES vs previous version:
1. Manuscript.assigned_reviewer_id uses lazy='select' and handles None safely
2. User.to_dict() uses getattr to safely access role
3. All relationships use lazy loading options to prevent DetachedInstanceError
4. Manuscript.formatted_pdf_path added — stores the editor-uploaded formatted PDF
   (separate from file_path which is the author's original Word submission)
5. New status values: accepted_pending_payment, payment_received, ready_to_publish
"""
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from app import db


def now_utc():
    return datetime.now(timezone.utc)


# ── Roles ─────────────────────────────────────────────────────────────────────

class Role(db.Model):
    __tablename__ = "roles"

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(200))

    users = db.relationship("User", back_populates="role", lazy="dynamic")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "description": self.description}


# ── Users ─────────────────────────────────────────────────────────────────────

class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    full_name     = db.Column(db.String(120), nullable=False)
    role_id       = db.Column(db.Integer, db.ForeignKey("roles.id"), nullable=False)
    is_active     = db.Column(db.Boolean, default=True)
    institution   = db.Column(db.String(200))
    country       = db.Column(db.String(80))

    reset_token        = db.Column(db.String(100))
    reset_token_expiry = db.Column(db.DateTime(timezone=True))

    created_at = db.Column(db.DateTime(timezone=True), default=now_utc)
    updated_at = db.Column(db.DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    role = db.relationship("Role", back_populates="users", lazy="joined")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        role_name = None
        try:
            role_name = self.role.name if self.role else None
        except Exception:
            role_name = None
        return {
            "id":          self.id,
            "email":       self.email,
            "full_name":   self.full_name,
            "role":        role_name,
            "is_active":   self.is_active,
            "institution": self.institution,
            "country":     self.country,
            "created_at":  self.created_at.strftime("%Y-%m-%d") if self.created_at else None,
        }


# ── Volume / Issue ─────────────────────────────────────────────────────────────

class Volume(db.Model):
    __tablename__ = "volumes"

    id         = db.Column(db.Integer, primary_key=True)
    number     = db.Column(db.Integer, nullable=False, unique=True)
    year       = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=now_utc)

    issues = db.relationship("Issue", back_populates="volume", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id":     self.id,
            "number": self.number,
            "year":   self.year,
            "issues": [i.to_dict() for i in sorted(self.issues, key=lambda x: x.number)],
        }


class Issue(db.Model):
    __tablename__ = "issues"

    id         = db.Column(db.Integer, primary_key=True)
    volume_id  = db.Column(db.Integer, db.ForeignKey("volumes.id"), nullable=False)
    number     = db.Column(db.Integer, nullable=False)
    month      = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=now_utc)

    volume   = db.relationship("Volume", back_populates="issues")
    articles = db.relationship("Article", back_populates="issue")

    def to_dict(self):
        return {
            "id":        self.id,
            "number":    self.number,
            "month":     self.month,
            "volume_id": self.volume_id,
        }


# ── Article ───────────────────────────────────────────────────────────────────

class Article(db.Model):
    __tablename__ = "articles"

    id       = db.Column(db.Integer, primary_key=True)
    issue_id = db.Column(db.Integer, db.ForeignKey("issues.id"), nullable=True)

    title    = db.Column(db.Text, nullable=False)
    abstract = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.Text, nullable=False)
    authors  = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    doi      = db.Column(db.String(120), unique=True)
    pdf_url  = db.Column(db.String(255))

    status    = db.Column(db.String(30), default="published", nullable=False)
    views     = db.Column(db.Integer, default=0)
    downloads = db.Column(db.Integer, default=0)

    published_at = db.Column(db.DateTime(timezone=True))
    created_at   = db.Column(db.DateTime(timezone=True), default=now_utc)
    updated_at   = db.Column(db.DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    issue = db.relationship("Issue", back_populates="articles")

    def to_dict(self, detail=False):
        data = {
            "id":        self.id,
            "title":     self.title,
            "authors":   self.authors,
            "keywords":  [k.strip() for k in self.keywords.split(",")],
            "category":  self.category,
            "doi":       self.doi,
            "pdf_url":   self.pdf_url,
            "status":    self.status,
            "views":     self.views,
            "downloads": self.downloads,
            "date":      self.published_at.strftime("%B %d, %Y") if self.published_at else None,
        }
        if detail:
            data["abstract"] = self.abstract
        if self.issue:
            data["issue"] = {
                "number": self.issue.number,
                "month":  self.issue.month,
                "volume": {
                    "number": self.issue.volume.number,
                    "year":   self.issue.volume.year,
                },
            }
        return data


# ── Manuscript ────────────────────────────────────────────────────────────────

class Manuscript(db.Model):
    __tablename__ = "manuscripts"

    id                  = db.Column(db.Integer, primary_key=True)
    manuscript_number   = db.Column(db.String(30), unique=True, nullable=False)
    manuscript_type     = db.Column(db.String(50), nullable=False)
    title               = db.Column(db.Text, nullable=False)
    abstract            = db.Column(db.Text, nullable=False)
    keywords            = db.Column(db.Text, nullable=False)
    authors             = db.Column(db.Text, nullable=False)
    corresponding_email = db.Column(db.String(120), nullable=False)

    # Author's original Word file (.doc / .docx)
    file_path           = db.Column(db.String(255))

    # Editor's formatted PDF — uploaded after payment, before publication
    # Run: python migrate_add_formatted_pdf.py  (if upgrading an existing DB)
    formatted_pdf_path  = db.Column(db.String(255))

    # Workflow status
    # submitted → under_review → revision_required / accepted_pending_payment / rejected
    # accepted_pending_payment → payment_received → ready_to_publish → published
    status            = db.Column(db.String(40), default="submitted", nullable=False)
    reviewer_comments = db.Column(db.Text)

    assigned_reviewer_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=True, default=None
    )

    submitted_at = db.Column(db.DateTime(timezone=True), default=now_utc)
    updated_at   = db.Column(db.DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    assigned_reviewer = db.relationship(
        "User", foreign_keys=[assigned_reviewer_id], lazy="select"
    )

    def to_dict(self):
        reviewer_name = None
        try:
            if self.assigned_reviewer_id and self.assigned_reviewer:
                reviewer_name = self.assigned_reviewer.full_name
        except Exception:
            reviewer_name = None

        return {
            "id":                   self.id,
            "manuscript_number":    self.manuscript_number,
            "manuscript_type":      self.manuscript_type,
            "title":                self.title,
            "authors":              self.authors,
            "corresponding_email":  self.corresponding_email,
            "status":               self.status,
            "reviewer_comments":    self.reviewer_comments,
            "assigned_reviewer":    reviewer_name,
            "file_path":            self.file_path,
            "formatted_pdf_path":   self.formatted_pdf_path,
            "has_formatted_pdf":    bool(self.formatted_pdf_path),
            "submitted_at":         self.submitted_at.strftime("%Y-%m-%d") if self.submitted_at else None,
            "updated_at":           self.updated_at.strftime("%Y-%m-%d") if self.updated_at else None,
        }


# ── Editorial Board ───────────────────────────────────────────────────────────

class EditorialMember(db.Model):
    __tablename__ = "editorial_members"

    id             = db.Column(db.Integer, primary_key=True)
    name           = db.Column(db.String(120), nullable=False)
    role           = db.Column(db.String(80), nullable=False)
    institution    = db.Column(db.String(200))
    country        = db.Column(db.String(80))
    specialization = db.Column(db.String(200))
    email          = db.Column(db.String(120))
    photo_url      = db.Column(db.String(255))
    display_order  = db.Column(db.Integer, default=99)

    def to_dict(self):
        return {
            "id":             self.id,
            "name":           self.name,
            "role":           self.role,
            "institution":    self.institution,
            "country":        self.country,
            "specialization": self.specialization,
            "email":          self.email,
            "photo_url":      self.photo_url,
        }


# ── Join Applications ─────────────────────────────────────────────────────────

class JoinApplication(db.Model):
    __tablename__ = "join_applications"

    id               = db.Column(db.Integer, primary_key=True)
    application_type = db.Column(db.String(20), nullable=False)
    full_name        = db.Column(db.String(120), nullable=False)
    email            = db.Column(db.String(120), nullable=False)
    institution      = db.Column(db.String(200))
    country          = db.Column(db.String(80))
    research_field   = db.Column(db.String(200))
    degree           = db.Column(db.String(80))
    experience_years = db.Column(db.Integer)
    motivation       = db.Column(db.Text)
    cv_file_path     = db.Column(db.String(255))

    status       = db.Column(db.String(20), default="pending")
    submitted_at = db.Column(db.DateTime(timezone=True), default=now_utc)

    def to_dict(self):
        return {
            "id":               self.id,
            "application_type": self.application_type,
            "full_name":        self.full_name,
            "email":            self.email,
            "institution":      self.institution,
            "country":          self.country,
            "research_field":   self.research_field,
            "degree":           self.degree,
            "experience_years": self.experience_years,
            "motivation":       self.motivation,
            "status":           self.status,
            "submitted_at":     self.submitted_at.strftime("%Y-%m-%d"),
        }


# ── Contact Messages ──────────────────────────────────────────────────────────

class ContactMessage(db.Model):
    __tablename__ = "contact_messages"

    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(120), nullable=False)
    email      = db.Column(db.String(120), nullable=False)
    subject    = db.Column(db.String(200), nullable=False)
    message    = db.Column(db.Text, nullable=False)
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=now_utc)

    def to_dict(self):
        return {
            "id":         self.id,
            "name":       self.name,
            "email":      self.email,
            "subject":    self.subject,
            "message":    self.message,
            "is_read":    self.is_read,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M"),
        }