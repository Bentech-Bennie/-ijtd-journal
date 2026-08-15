from dotenv import load_dotenv
load_dotenv()

from app import create_app, db

app = create_app()

# Create all database tables on startup
with app.app_context():
    try:
        db.create_all()
        print("✅ Database tables created/verified successfully")
    except Exception as e:
        print(f"⚠️ Database init warning: {e}")

if __name__ == "__main__":
    app.run()