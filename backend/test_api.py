"""
test_email.py
Run this with:  python test_email.py
It tests your Gmail SMTP settings WITHOUT starting Flask.
"""
import smtplib, os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

MAIL_SERVER   = os.getenv("MAIL_SERVER",   "smtp.gmail.com")
MAIL_PORT     = int(os.getenv("MAIL_PORT", "587"))
MAIL_USERNAME = os.getenv("MAIL_USERNAME", "").strip()
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "").strip()
MAIL_SENDER   = os.getenv("MAIL_DEFAULT_SENDER", MAIL_USERNAME).strip()

print("\n" + "="*58)
print("  IJTD — Email Diagnostic")
print("="*58)
print(f"  MAIL_SERVER   : {MAIL_SERVER}")
print(f"  MAIL_PORT     : {MAIL_PORT}")
print(f"  MAIL_USERNAME : {MAIL_USERNAME or 'NOT SET'}")
print(f"  MAIL_PASSWORD : {'SET (' + str(len(MAIL_PASSWORD)) + ' chars)' if MAIL_PASSWORD else 'NOT SET'}")
print(f"  MAIL_SENDER   : {MAIL_SENDER or 'NOT SET'}")
print("="*58 + "\n")

if not MAIL_USERNAME or not MAIL_PASSWORD:
    print("PROBLEM: MAIL_USERNAME or MAIL_PASSWORD missing in .env\n")
    print("Add these lines to your .env file:")
    print("  MAIL_SERVER=smtp.gmail.com")
    print("  MAIL_PORT=587")
    print("  MAIL_USE_TLS=True")
    print("  MAIL_USERNAME=yourgmail@gmail.com")
    print("  MAIL_PASSWORD=abcdabcdabcdabcd   (16-char App Password, no spaces)")
    print("  MAIL_DEFAULT_SENDER=yourgmail@gmail.com\n")
    print("Gmail App Password steps:")
    print("  1. myaccount.google.com -> Security")
    print("  2. Enable 2-Step Verification")
    print("  3. Search 'App passwords' -> create one -> copy 16 chars")
    raise SystemExit(1)

print("Connecting to Gmail SMTP ...")
try:
    server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=10)
    server.ehlo(); server.starttls(); server.ehlo()
    print("TLS OK")
    server.login(MAIL_USERNAME, MAIL_PASSWORD)
    print("Login OK")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "[IJTD] Email config test"
    msg["From"]    = MAIL_SENDER
    msg["To"]      = MAIL_USERNAME
    msg.attach(MIMEText("<p>IJTD email is working correctly!</p>", "html"))
    server.sendmail(MAIL_SENDER, MAIL_USERNAME, msg.as_string())
    server.quit()
    print(f"\nSUCCESS: Test email sent to {MAIL_USERNAME}")
    print("Check your inbox (and spam folder).")

except smtplib.SMTPAuthenticationError:
    print("\nFAILED: Wrong username or password.")
    print("Make sure you are using a Gmail APP PASSWORD, not your account password.")
    print("Steps: myaccount.google.com -> Security -> App passwords")
except Exception as e:
    print(f"\nFAILED: {type(e).__name__}: {e}")