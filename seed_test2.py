import os
import sys
from datetime import datetime, timedelta
import random

# Add project root to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import Akademi, Ogrenci, Sinif, Derslik, DersProgrami, Odeme, Yoklama, OnKayit, OgrenciSinif

def seed_test2():
    db = SessionLocal()
    try:
        # Check if Test2 exists
        akademi = db.query(Akademi).filter(Akademi.name == "Test2").first()
        if not akademi:
            print("Test2 akademisi bulunamadı, oluşturuluyor...")
            akademi = Akademi(name="Test2", whatsapp_provider="callmebot")
            db.add(akademi)
            db.commit()
            db.refresh(akademi)
        else:
            print(f"Akademi bulundu: {akademi.name}")

        # 1. Derslik Ekle
        derslik1 = Derslik(ad="Gitar Odası A", kapasite=5, akademi_adi="Test2")
        derslik2 = Derslik(ad="Piyano Salonu B", kapasite=2, akademi_adi="Test2")
        db.add_all([derslik1, derslik2])
        db.commit()
        db.refresh(derslik1)
        db.refresh(derslik2)

        # 2. Sınıflar Ekle
        sinif1 = Sinif(sinif_adi="Gitar Başlangıç (Hafta Sonu)", kapasite=5, akademi_adi="Test2")
        sinif2 = Sinif(sinif_adi="Piyano İleri Seviye", kapasite=2, akademi_adi="Test2")
        db.add_all([sinif1, sinif2])
        db.commit()
        db.refresh(sinif1)
        db.refresh(sinif2)

        # 3. Ders Programı Ekle
        dp1 = DersProgrami(sinif_id=sinif1.id, derslik_id=derslik1.id, gun="Cumartesi", baslangic_saati="14:00", bitis_saati="15:00", ders_adi="Gitar Ders 1")
        dp2 = DersProgrami(sinif_id=sinif2.id, derslik_id=derslik2.id, gun="Pazar", baslangic_saati="10:00", bitis_saati="11:30", ders_adi="Piyano Ders 1")
        db.add_all([dp1, dp2])
        db.commit()

        # 4. Öğrenciler Ekle
        ogrenci1 = Ogrenci(isim="Ahmet", soyisim="Yılmaz", tc="11111111111", telefon="5551112233", eposta="ahmet@example.com", bakiye=500.0, anne_isim="Ayşe", anne_telefon="5559998877", akademi_adi="Test2")
        ogrenci2 = Ogrenci(isim="Zeynep", soyisim="Kaya", tc="22222222222", telefon="5552223344", bakiye=0.0, akademi_adi="Test2")
        db.add_all([ogrenci1, ogrenci2])
        db.commit()
        db.refresh(ogrenci1)
        db.refresh(ogrenci2)

        # Öğrencileri sınıflara ekle
        os1 = OgrenciSinif(ogrenci_id=ogrenci1.id, sinif_id=sinif1.id)
        os2 = OgrenciSinif(ogrenci_id=ogrenci2.id, sinif_id=sinif2.id)
        db.add_all([os1, os2])
        db.commit()

        # 5. Ödemeler Ekle
        odeme1 = Odeme(ogrenci_id=ogrenci1.id, tutar=500.0, tarih=datetime.utcnow() - timedelta(days=5), odeme_yontemi="Nakit", durum="Ödendi", odeme_turu="Kurs Ücreti", aciklama="Eylül Taksidi", akademi_adi="Test2")
        odeme2 = Odeme(ogrenci_id=ogrenci2.id, tutar=1000.0, tarih=datetime.utcnow() + timedelta(days=2), durum="Bekliyor", odeme_turu="Kurs Ücreti", aciklama="Ekim Taksidi", akademi_adi="Test2")
        db.add_all([odeme1, odeme2])
        db.commit()

        # 6. Yoklamalar Ekle
        yoklama1 = Yoklama(ogrenci_id=ogrenci1.id, sinif_id=sinif1.id, tarih=datetime.utcnow() - timedelta(days=2), durum="Geldi", akademi_adi="Test2")
        yoklama2 = Yoklama(ogrenci_id=ogrenci2.id, sinif_id=sinif2.id, tarih=datetime.utcnow() - timedelta(days=1), durum="Gelmedi", aciklama="Hasta", akademi_adi="Test2")
        db.add_all([yoklama1, yoklama2])
        db.commit()

        # 7. Ön Kayıtlar Ekle
        onkayit = OnKayit(ogrenci_adi="Mehmet", ogrenci_soyadi="Demir", veli_adi="Hasan", veli_soyadi="Demir", telefon="5557776655", ilgilenilen_brans="Keman", durum="Beklemede", notlar="Hafta içi akşam saatleri uygun.", akademi_adi="Test2")
        db.add(onkayit)
        db.commit()

        print("Test2 için rastgele mock veri başarıyla eklendi!")

    except Exception as e:
        print(f"Hata oluştu: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_test2()
