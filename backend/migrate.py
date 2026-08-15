"""
migrate_add_reviewer.py
Adds the assigned_reviewer_id column to the manuscripts table.
Run ONCE: python migrate_add_reviewer.py
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
        
        # Check manuscripts columns
        ms_cols = [c['name'] for c in inspector.get_columns('manuscripts')]
        print(f"Current manuscripts columns: {ms_cols}")
        
        if 'assigned_reviewer_id' not in ms_cols:
            conn.execute(text(
                "ALTER TABLE manuscripts ADD COLUMN assigned_reviewer_id INTEGER REFERENCES users(id)"
            ))
            conn.commit()
            print("OK  Added assigned_reviewer_id to manuscripts")
        else:
            print("--  assigned_reviewer_id already exists")
        
        print("\nDone. Re-run test_api.py to verify all 26 tests pass.")