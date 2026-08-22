from database import SessionLocal
from models import Ogrenci

def check_students():
    db = SessionLocal()
    try:
        students = db.query(Ogrenci).all()
        print(f"Total students in DB: {len(students)}")
        
        from sqlalchemy import func
        academy_counts = db.query(Ogrenci.akademi_adi, func.count(Ogrenci.id)).group_by(Ogrenci.akademi_adi).all()
        
        print("Student counts by academy:")
        for ac, count in academy_counts:
            print(f"- {ac}: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    check_students()
