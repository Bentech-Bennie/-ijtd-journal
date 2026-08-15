#!/usr/bin/env python3
"""
DIAGNOSTIC SCRIPT — run this to understand what's happening with file serving.
Place in backend/ and run: python debug_files.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from app import create_app, db
from app.models import Manuscript, Article

app = create_app()

with app.app_context():
    upload_folder = app.config.get("UPLOAD_FOLDER", "")
    print(f"\n{'='*60}")
    print(f"UPLOAD_FOLDER: {upload_folder}")
    print(f"Folder exists: {os.path.exists(upload_folder)}")
    
    if os.path.exists(upload_folder):
        files = os.listdir(upload_folder)
        print(f"Files in folder ({len(files)} total):")
        for f in files[:20]:
            full = os.path.join(upload_folder, f)
            size = os.path.getsize(full)
            print(f"  {f}  ({size} bytes)")
    
    print(f"\n--- MANUSCRIPTS ---")
    mss = Manuscript.query.all()
    for ms in mss[:10]:
        exists = False
        if ms.file_path:
            full = os.path.join(upload_folder, ms.file_path)
            exists = os.path.exists(full)
        print(f"  [{ms.manuscript_number}] file_path={ms.file_path!r}  exists={exists}")
    
    print(f"\n--- ARTICLES ---")
    arts = Article.query.all()
    for a in arts[:10]:
        exists = False
        if a.pdf_url:
            full = os.path.join(upload_folder, a.pdf_url)
            exists = os.path.exists(full)
        print(f"  [{a.id}] title={a.title[:40]!r}  pdf_url={a.pdf_url!r}  exists={exists}")
    
    print(f"{'='*60}\n")