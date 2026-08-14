from database import SessionLocal
from models import Ogrenci
from schemas import OgrenciResponse

db = SessionLocal()
try:
    ogrenciler = db.query(Ogrenci).all()
    print(f"Found {len(ogrenciler)} students.")
    if ogrenciler:
        first = ogrenciler[0]
        print(f"First student from DB: {first.__dict__}")
        try:
            # Let's try to convert it to OgrenciResponse
            resp = OgrenciResponse.model_validate(first)
            print("Validation successful!")
        except Exception as e:
            print("Validation error:", e)
finally:
    db.close()
