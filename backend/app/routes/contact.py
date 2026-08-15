"""
Contact Blueprint — /api/contact
"""
from flask import Blueprint, jsonify, request, current_app
from app import db, mail
from app.models import ContactMessage
from flask_mail import Message

contact_bp = Blueprint("contact", __name__)


@contact_bp.route("", methods=["POST"])
def send_message():
    """
    Send a contact message and forward to admin
    """
    data = request.get_json(silent=True) or {}

    required = ["name", "email", "subject", "message"]
    missing = [f for f in required if not data.get(f, "").strip()]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    # Save to database
    cm = ContactMessage(
        name=data["name"],
        email=data["email"],
        subject=data["subject"],
        message=data["message"],
    )
    db.session.add(cm)
    db.session.commit()

    # Email Logic
    try:
        # 1. Auto-reply to the sender
        auto_reply = Message(
            subject=f"Re: {cm.subject} — IJTD",
            recipients=[cm.email],
            body=(
                f"Dear {cm.name},\n\n"
                f"Thank you for contacting IJTD.\n"
                f"We have received your message and will respond within 2 business days.\n\n"
                f"Best regards,\nThe IJTD Team"
            ),
        )
        mail.send(auto_reply)

        # 2. Forward the actual message to the Admin Inbox
        admin_notification = Message(
            subject=f"New Contact Message: {cm.subject}",
            recipients=["journalijtd@gmail.com"],
            reply_to=cm.email,  # This allows you to click 'Reply' in Gmail to contact the user
            body=(
                f"New message from the IJTD Contact Form:\n\n"
                f"Name: {cm.name}\n"
                f"Email: {cm.email}\n"
                f"Subject: {cm.subject}\n\n"
                f"Message:\n{cm.message}"
            ),
        )
        mail.send(admin_notification)

    except Exception as e:
        # Log the error so you can see it in your terminal/logs if it fails
        current_app.logger.error(f"Email sending failed: {e}")
        # We still return 201 because the message was saved to the DB
        pass

    return jsonify({"message": "Message sent successfully"}), 201