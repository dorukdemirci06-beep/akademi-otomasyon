import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

db = SessionLocal()
akademiler = db.query(models.Akademi).all()
for ak in akademiler:
    print(f"ID: {ak.id}, Name: {ak.name}")
db.close()
