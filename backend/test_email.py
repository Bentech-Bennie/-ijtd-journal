"""
test_email.py — run this FIRST to check if your Gmail SMTP credentials work
at all, before touching any Flask code.

Usage:
    python test_email.py your.real.email@example.com

If this fails, the problem is your .env / Gmail App Password — fix that
before looking at any application code.
If this succeeds but emails still don't arrive from the app, the problem
is somewhere in the Flask-Mail config or in how a route calls mail.send().
"""
import os
import sys
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

MAIL_SERVER   = os.getenv("MAIL_SERVER", "smtp.gmail.com")
MAIL_PORT     = int(os.getenv("MAIL_PORT", 587))
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "")
MAIL_SENDER   = os.getenv("MAIL_DEFAULT_SENDER", MAIL_USERNAME)

print("=" * 60)
print("IJTD Email Configuration Test")
print("=" * 60)
print(f"MAIL_SERVER   = {MAIL_SERVER}")
print(f"MAIL_PORT     = {MAIL_PORT}")
print(f"MAIL_USERNAME = {MAIL_USERNAME or '(NOT SET — this is your problem)'}")
print(f"MAIL_PASSWORD = {'*' * len(MAIL_PASSWORD) if MAIL_PASSWORD else '(NOT SET — this is your problem)'}")
print(f"MAIL_SENDER   = {MAIL_SENDER}")
print("=" * 60)

if not MAIL_USERNAME or not MAIL_PASSWORD:
    print("\n❌ STOP: MAIL_USERNAME and/or MAIL_PASSWORD is missing from your .env file.")
    print("   This alone explains why no emails are being sent — Flask-Mail")
    print("   is configured to silently suppress sending when these are empty.")
    sys.exit(1)

if len(sys.argv) < 2:
    print("\nUsage: python test_email.py your.real.email@example.com")
    sys.exit(1)

recipient = sys.argv[1]

msg = MIMEText("If you received this, your Gmail SMTP credentials work correctly.")
msg["Subject"] = "IJTD — SMTP Test Email"
msg["From"]    = MAIL_SENDER
msg["To"]      = recipient

try:
    print(f"\nConnecting to {MAIL_SERVER}:{MAIL_PORT} ...")
    with smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=10) as server:
        server.set_debuglevel(1)   # prints the full SMTP conversation
        server.starttls()
        print("Logging in ...")
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        print("Sending ...")
        server.sendmail(MAIL_SENDER, [recipient], msg.as_string())
    print(f"\n✅ SUCCESS — check {recipient}'s inbox (and spam folder).")
except smtplib.SMTPAuthenticationError as e:
    print(f"\n❌ AUTHENTICATION FAILED: {e}")
    print("   This almost always means MAIL_PASSWORD is your normal Gmail")
    print("   password instead of a 16-character App Password.")
    print("   Fix: Google Account → Security → 2-Step Verification → App passwords")
    print("   (2-Step Verification must be ON first, then generate an app password")
    print("   for 'Mail', and paste it into MAIL_PASSWORD with no spaces.)")
except Exception as e:
    print(f"\n❌ FAILED: {type(e).__name__}: {e}")