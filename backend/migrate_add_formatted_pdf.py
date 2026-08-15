"""
migrate_add_formatted_pdf.py
Adds the formatted_pdf_path column to the manuscripts table.
Run ONCE on an existing database: python migrate_add_formatted_pdf.py
New databases created with db.create_all() already have the column via models.py.
"""
import os, sys
from dotenv import load_dotenv
load_dotenv()
sys.path.insert(0, os.path.dirname(__file__))

from app import create_app, db
from sqlalchemy import text, inspect

app = create_app()
with app.app_context():
    with db.engine.connect() as conn:
        inspector = inspect(db.engine)
        ms_cols = [c['name'] for c in inspector.get_columns('manuscripts')]
        print(f"Current manuscripts columns: {ms_cols}")

        if 'formatted_pdf_path' not in ms_cols:
            conn.execute(text(
                "ALTER TABLE manuscripts ADD COLUMN formatted_pdf_path VARCHAR(255)"
            ))
            conn.commit()
            print("OK  Added formatted_pdf_path to manuscripts")
        else:
            print("--  formatted_pdf_path already exists")

        print("\nDone. Restart Flask to pick up the new column.")