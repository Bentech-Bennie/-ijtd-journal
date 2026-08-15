"""
fix_passwords.py
Run this ONCE from your backend folder to fix reviewer/editor passwords:
   python fix_passwords.py
"""
import os, sys
from dotenv import load_dotenv
load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from app.models import User

app = create_app()
with app.app_context():
    users_to_fix = [
        ("admin@ijtd.com",    "Admin@IJTD2026!"),
        ("editor@ijtd.com",   "Editor@IJTD2026!"),
        ("reviewer@ijtd.com", "Reviewer@IJTD2026!"),
    ]
    for email, password in users_to_fix:
        user = User.query.filter_by(email=email).first()
        if user:
            user.set_password(password)
            print(f"  OK  Reset password for {email}")
        else:
            print(f"  !!  User not found: {email} — run seed.py first")
    db.session.commit()
    print("\nDone. Login with:")
    print("  admin@ijtd.com     / Admin@IJTD2026!")
    print("  editor@ijtd.com    / Editor@IJTD2026!")
    print("  reviewer@ijtd.com  / Reviewer@IJTD2026!")