"""
auth.py — JWT authentication helpers
Install: pip install flask-jwt-extended
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import (
    JWTManager,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)
from app.models import User

jwt = JWTManager()


def init_auth(app):
    """Call this in create_app() after other extensions."""
    jwt.init_app(app)


# ── Role decorators ────────────────────────────────────────────────────────────

def role_required(*roles):
    """Decorator: require the current user to have one of the given role names."""
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or not user.is_active:
                return jsonify({"error": "User not found or inactive"}), 401
            if user.role.name not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def admin_required(fn):
    return role_required("admin")(fn)


def editor_required(fn):
    return role_required("admin", "editor")(fn)


def reviewer_required(fn):
    return role_required("admin", "editor", "reviewer")(fn)


def get_current_user():
    """Helper: return the User object for the current JWT identity."""
    user_id = get_jwt_identity()
    return User.query.get(user_id) if user_id else None