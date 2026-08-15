"""
Join Blueprint — /api/join
Handles reviewer and editorial board member applications.
"""
from flask import Blueprint, jsonify, request
from app import db, mail
from app.models import JoinApplication
from flask_mail import Message

join_bp = Blueprint("join", __name__)


def _validate_join(data):
    required = ["fullName", "email", "institution", "country", "researchField", "degree"]
    missing = [f for f in required if not data.get(f, "").strip()]
    return missing


@join_bp.route("/reviewer", methods=["POST"])
def apply_reviewer():
    """
    Apply as a reviewer
    ---
    tags:
      - Join
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - fullName
            - email
            - institution
            - country
            - researchField
            - degree
          properties:
            fullName:
              type: string
              example: Dr. Jane Smith
            email:
              type: string
              example: jane.smith@university.edu
            institution:
              type: string
              example: University of Douala
            country:
              type: string
              example: Cameroon
            researchField:
              type: string
              example: Biological Sciences
            degree:
              type: string
              example: PhD
            experienceYears:
              type: integer
              example: 8
            motivation:
              type: string
              example: I want to contribute to the scientific community...
    responses:
      201:
        description: Application submitted successfully
      400:
        description: Missing required fields
    """
    data = request.get_json(silent=True) or {}
    missing = _validate_join(data)
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    app_record = JoinApplication(
        application_type="reviewer",
        full_name=data["fullName"],
        email=data["email"],
        institution=data.get("institution", ""),
        country=data.get("country", ""),
        research_field=data.get("researchField", ""),
        degree=data.get("degree", ""),
        experience_years=data.get("experienceYears"),
        motivation=data.get("motivation", ""),
    )
    db.session.add(app_record)
    db.session.commit()

    # Send confirmation
    try:
        msg = Message(
            subject=f"IJTD — Reviewer Application Received",
            recipients=[app_record.email],
            body=(
                f"Dear {app_record.full_name},\n\n"
                f"Thank you for applying to join IJTD as a Reviewer.\n\n"
                f"We will review your application and get back to you shortly.\n\n"
                f"Best regards,\nThe IJTD Editorial Team"
            ),
        )
        mail.send(msg)
    except Exception:
        pass

    return jsonify({"message": "Application submitted successfully"}), 201


@join_bp.route("/editorial", methods=["POST"])
def apply_editorial():
    """
    Apply for editorial board membership
    ---
    tags:
      - Join
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - fullName
            - email
            - institution
            - country
            - researchField
            - degree
          properties:
            fullName:
              type: string
            email:
              type: string
            institution:
              type: string
            country:
              type: string
            researchField:
              type: string
            degree:
              type: string
            experienceYears:
              type: integer
            motivation:
              type: string
    responses:
      201:
        description: Application submitted successfully
      400:
        description: Missing required fields
    """
    data = request.get_json(silent=True) or {}
    missing = _validate_join(data)
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    app_record = JoinApplication(
        application_type="editorial",
        full_name=data["fullName"],
        email=data["email"],
        institution=data.get("institution", ""),
        country=data.get("country", ""),
        research_field=data.get("researchField", ""),
        degree=data.get("degree", ""),
        experience_years=data.get("experienceYears"),
        motivation=data.get("motivation", ""),
    )
    db.session.add(app_record)
    db.session.commit()

    # Send confirmation
    try:
        msg = Message(
            subject=f"IJTD — Editorial Board Application Received",
            recipients=[app_record.email],
            body=(
                f"Dear {app_record.full_name},\n\n"
                f"Thank you for applying to join IJTD as an Editorial Board Member.\n\n"
                f"We will review your application and get back to you shortly.\n\n"
                f"Best regards,\nThe IJTD Editorial Team"
            ),
        )
        mail.send(msg)
    except Exception:
        pass

    return jsonify({"message": "Application submitted successfully"}), 201