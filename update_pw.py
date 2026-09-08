import sys
import os
import bcrypt
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

db = SessionLocal()
admin_user = db.query(models.Kullanici).filter(models.Kullanici.kullanici_adi == "doruk").first()
if admin_user:
    admin_user.sifre = hash_password("Dd150106!")
    db.commit()
    print("Password updated for doruk!")
else:
    print("User doruk not found.")
db.close()
