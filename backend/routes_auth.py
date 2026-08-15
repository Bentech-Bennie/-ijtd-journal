"""
Auth Blueprint — /api/auth
Handles login, token refresh, password reset, and user profile.

KEY FIX: flask-jwt-extended v4+ requires identity to be a STRING.
We use str(user.id) everywhere and convert back with int() when querying.
"""
import secrets
from datetime import datetime, timezone, timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from app import db, mail
from app.models import User, Role
from flask_mail import Message
import os

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login and receive JWT tokens
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [email, password]
          properties:
            email:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    data     = request.get_json(silent=True) or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_active:
        return jsonify({"error": "Account is deactivated. Contact support."}), 403

    # CRITICAL: identity MUST be a string in flask-jwt-extended v4+
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify({
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "user":          user.to_dict(),
    })


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh an access token using the refresh token."""
    user_id      = int(get_jwt_identity())   # convert back from string
    user         = User.query.get(user_id)
    if not user or not user.is_active:
        return jsonify({"error": "User not found"}), 401
    access_token = create_access_token(identity=str(user_id))
    return jsonify({"access_token": access_token})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Get current authenticated user's profile."""
    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """
    Request a password reset email
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [email]
          properties:
            email:
              type: string
    responses:
      200:
        description: Reset email sent (always 200 to avoid email enumeration)
    """
    data  = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()

    user = User.query.filter_by(email=email).first()
    if user:
        token = secrets.token_urlsafe(32)
        user.reset_token        = token
        user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=2)
        db.session.commit()

        # Use FRONTEND_URL so the link opens in the React app, not the Flask server
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        reset_url    = f"{frontend_url}/reset-password?token={token}"

        try:
            msg = Message(
                subject="IJTD — Password Reset Request",
                recipients=[user.email],
                body=(
                    f"Dear {user.full_name},\n\n"
                    f"We received a request to reset your IJTD account password.\n\n"
                    f"Click the link below (valid for 2 hours):\n{reset_url}\n\n"
                    f"If you did not request this, please ignore this email.\n\n"
                    f"Best regards,\nThe IJTD Team"
                ),
            )
            mail.send(msg)
        except Exception:
            pass   # don't expose mail errors to the client

    return jsonify({"message": "If that email exists, a reset link has been sent."})


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    """
    Reset password using a valid token
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required: [token, password]
          properties:
            token:
              type: string
            password:
              type: string
    responses:
      200:
        description: Password reset successful
      400:
        description: Invalid or expired token
    """
    data     = request.get_json(silent=True) or {}
    token    = data.get("token", "").strip()
    password = data.get("password", "")

    if not token or not password:
        return jsonify({"error": "Token and new password are required"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry:
        return jsonify({"error": "Invalid or expired reset token"}), 400

    if user.reset_token_expiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        return jsonify({"error": "Reset token has expired. Please request a new one."}), 400

    user.set_password(password)
    user.reset_token        = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({"message": "Password reset successful. You can now log in."})


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Change password for the currently authenticated user."""
    data             = request.get_json(silent=True) or {}
    current_password = data.get("current_password", "")
    new_password     = data.get("new_password", "")

    if not current_password or not new_password:
        return jsonify({"error": "Both current and new password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user_id = int(get_jwt_identity())
    user    = User.query.get(user_id)
    if not user or not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    user.set_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"})