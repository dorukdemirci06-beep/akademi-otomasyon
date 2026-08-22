import sys
from datetime import datetime
from database import SessionLocal
from models import Ogretmen, Personel, Degerlendirme

def seed():
    db = SessionLocal()
    
    akademi_adi = "Test1"
    
    # Teachers
    teachers = [
        {"isim": 'Ahmet Yılmaz', "brans": 'Piyano & Solfej', "telefon": '0532 111 2233', "eposta": 'ahmet.yilmaz@akademisaas.com', "baslama_tarihi": '2024-09-01', "durum": 'Aktif', "notlar": 'Piyano zümre başkanı, ileri seviye grup dersleri veriyor.', "akademi_adi": akademi_adi},
        {"isim": 'Elif Kaya', "brans": 'Keman & Müzik Teorisi', "telefon": '0533 222 3344', "eposta": 'elif.kaya@akademisaas.com', "baslama_tarihi": '2025-01-15', "durum": 'Aktif', "notlar": 'Orkestra ve teori dersleri sorumlusu.', "akademi_adi": akademi_adi},
        {"isim": 'Caner Öztürk', "brans": 'Dans & Koreografi', "telefon": '0534 333 4455', "eposta": 'caner.ozturk@akademisaas.com', "baslama_tarihi": '2025-03-10', "durum": 'Aktif', "notlar": 'Modern dans eğitmeni ve sahne performans koçu.', "akademi_adi": akademi_adi}
    ]
    
    for t in teachers:
        db.add(Ogretmen(**t))
        
    # Staff
    staff = [
        {"isim": 'Selin Tekin', "unvan": 'Danışma & Ön Büro Sorumlusu', "telefon": '0535 444 5566', "eposta": 'selin.tekin@akademisaas.com', "baslama_tarihi": '2024-10-01', "durum": 'Aktif', "notlar": 'Veli karşılamaları ve ön kayıt takip sorumlusu.', "akademi_adi": akademi_adi},
        {"isim": 'Murat Erdem', "unvan": 'İdari İşler & Operasyon', "telefon": '0536 555 6677', "eposta": 'murat.erdem@akademisaas.com', "baslama_tarihi": '2024-11-15', "durum": 'Aktif', "notlar": 'Bina idaresi, materyal tedariği ve sınıf organizasyonları.', "akademi_adi": akademi_adi}
    ]
    
    for s in staff:
        db.add(Personel(**s))
        
    # Evaluations
    evaluations = [
        {"tur": 'ogretmen', "calisan_id": 1, "isim": 'Ahmet Yılmaz', "unvan": 'Piyano & Solfej', "puan": 5, "notlar": 'Öğrencilerle iletişimi mükemmel, veli memnuniyeti çok yüksek. Ders saatlerine tam uyum sağlıyor.', "kategori": 'Mükemmel İletişim, Dakiklik, Yüksek Motivasyon', "akademi_adi": akademi_adi},
        {"tur": 'ogretmen', "calisan_id": 2, "isim": 'Elif Kaya', "unvan": 'Keman & Müzik Teorisi', "puan": 5, "notlar": 'Yoklama kayıtlarını düzenli tutuyor, müfredat takibinde son derece başarılı.', "kategori": 'Düzenli Yoklama, Müfredat Takibi', "akademi_adi": akademi_adi},
        {"tur": 'ogretmen', "calisan_id": 3, "isim": 'Caner Öztürk', "unvan": 'Dans & Koreografi', "puan": 5, "notlar": 'Grup derslerinde öğrenci enerjisini yüksek tutuyor, etkinliklerde özverili.', "kategori": 'Grup Dinamiği, Etkinlik Yönetimi', "akademi_adi": akademi_adi},
        {"tur": 'personel', "calisan_id": 101, "isim": 'Selin Tekin', "unvan": 'Danışma & Ön Büro Sorumlusu', "puan": 5, "notlar": 'Ön kayıtlara gelen velileri son derece güler yüzlü karşılıyor, kayıt takibini ve geri dönüşleri eksiksiz yürütüyor.', "kategori": 'Güler Yüz, Hızlı Kayıt Takibi, Veli İletişimi', "akademi_adi": akademi_adi},
        {"tur": 'personel', "calisan_id": 102, "isim": 'Murat Erdem', "unvan": 'İdari İşler & Operasyon', "puan": 5, "notlar": 'Sınıf düzeni, havalandırma ve ders materyallerinin tedariğinde çok pratik ve yardımsever.', "kategori": 'Operasyonel Başarı, Zaman Yönetimi', "akademi_adi": akademi_adi}
    ]
    
    for e in evaluations:
        db.add(Degerlendirme(**e))
        
    db.commit()
    db.close()
    print("Seed completed using SQLAlchemy.")

if __name__ == '__main__':
    seed()
