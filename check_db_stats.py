from database import SessionLocal
import models
from sqlalchemy import func

def comprehensive_check():
    db = SessionLocal()
    try:
        # Check academies
        academies = db.query(models.Akademi).all()
        print(f"--- Akademiler ({len(academies)}) ---")
        for a in academies:
            print(f"- {a.name}")
            
        print("\n--- Öğrenciler (Duruma ve Akademiye Göre) ---")
        student_stats = db.query(
            models.Ogrenci.akademi_adi, 
            models.Ogrenci.durum, 
            func.count(models.Ogrenci.id)
        ).group_by(models.Ogrenci.akademi_adi, models.Ogrenci.durum).all()
        
        for akademi, durum, count in student_stats:
            print(f"Akademi: {akademi} | Durum: {durum} | Sayı: {count}")
            
        print("\n--- Sınıflar (Akademiye Göre) ---")
        class_stats = db.query(
            models.Sinif.akademi_adi, 
            func.count(models.Sinif.id)
        ).group_by(models.Sinif.akademi_adi).all()
        
        for akademi, count in class_stats:
            print(f"Akademi: {akademi} | Sınıf Sayısı: {count}")

        print("\n--- Kullanıcılar (Akademiye Göre) ---")
        user_stats = db.query(
            models.Kullanici.akademi_adi,
            models.Kullanici.rol,
            func.count(models.Kullanici.id)
        ).group_by(models.Kullanici.akademi_adi, models.Kullanici.rol).all()
        
        for akademi, rol, count in user_stats:
            print(f"Akademi: {akademi} | Rol: {rol} | Sayı: {count}")

    finally:
        db.close()

if __name__ == "__main__":
    comprehensive_check()
