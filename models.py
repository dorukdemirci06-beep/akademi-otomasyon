from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class Ogrenci(Base):
    __tablename__ = "ogrenciler"

    id = Column(Integer, primary_key=True, index=True)
    isim = Column(String, nullable=False)
    soyisim = Column(String, nullable=False)
    tc = Column(String, nullable=True, index=True)
    telefon = Column(String, index=True, nullable=True)
    eposta = Column(String, index=True, nullable=True)
    adres = Column(String, nullable=True)
    
    anne_isim = Column(String, nullable=True)
    anne_tc = Column(String, nullable=True)
    anne_telefon = Column(String, nullable=True)
    anne_eposta = Column(String, nullable=True)
    anne_meslek = Column(String, nullable=True)
    
    baba_isim = Column(String, nullable=True)
    baba_tc = Column(String, nullable=True)
    baba_telefon = Column(String, nullable=True)
    baba_eposta = Column(String, nullable=True)
    baba_meslek = Column(String, nullable=True)
    
    dogum_tarihi = Column(String, nullable=True) # YYYY-MM-DD

    bakiye = Column(Float, default=0.0)
    durum = Column(String, default="Aktif") # Aktif, Pasif
    akademi_adi = Column(String, nullable=True, default="Test1", index=True)
    kayit_tarihi = Column(DateTime, default=datetime.utcnow)

    # İlişkiler
    siniflar = relationship("OgrenciSinif", back_populates="ogrenci")
    odemeler = relationship("Odeme", back_populates="ogrenci")
    yoklamalar = relationship("Yoklama", back_populates="ogrenci")

    @property
    def son_odeme_tarihi(self):
        if self.odemeler:
            tarihler = [o.tarih for o in self.odemeler if o.tarih and o.durum == 'Ödendi']
            if not tarihler:
                tarihler = [o.tarih for o in self.odemeler if o.tarih]
            return max(tarihler) if tarihler else None
        return None

    @property
    def gecikmis_odeme_var_mi(self):
        if self.odemeler:
            now = datetime.utcnow()
            for o in self.odemeler:
                if o.durum in ['Bekliyor', 'Gecikti'] and o.tarih and o.tarih <= now:
                    return True
        return False

    @property
    def en_yakin_vade_tarihi(self):
        if self.odemeler:
            vabeler = [o.tarih for o in self.odemeler if o.durum in ['Bekliyor', 'Gecikti'] and o.tarih]
            return min(vabeler) if vabeler else None
        return None

class Sinif(Base):
    __tablename__ = "siniflar"

    id = Column(Integer, primary_key=True, index=True)
    sinif_adi = Column(String, nullable=False, index=True)
    kapasite = Column(Integer, default=20)
    akademi_adi = Column(String, nullable=True, default="Test1", index=True)

    # İlişkiler
    ogrenciler = relationship("OgrenciSinif", back_populates="sinif")
    yoklamalar = relationship("Yoklama", back_populates="sinif")

class OgrenciSinif(Base):
    __tablename__ = "ogrenci_sinif"

    id = Column(Integer, primary_key=True, index=True)
    ogrenci_id = Column(Integer, ForeignKey("ogrenciler.id"))
    sinif_id = Column(Integer, ForeignKey("siniflar.id"))
    kalan_ders_hakki = Column(Integer, default=0)

    # İlişkiler
    ogrenci = relationship("Ogrenci", back_populates="siniflar")
    sinif = relationship("Sinif", back_populates="ogrenciler")

class Odeme(Base):
    __tablename__ = "odemeler"

    id = Column(Integer, primary_key=True, index=True)
    ogrenci_id = Column(Integer, ForeignKey("ogrenciler.id"))
    tutar = Column(Float, nullable=False)
    tarih = Column(DateTime, default=datetime.utcnow)
    odeme_yontemi = Column(String) # Kredi Kartı, Nakit, Havale
    durum = Column(String) # Ödendi, Bekliyor, Gecikti
    odeme_periyodu = Column(String, default="Aylık") # Aylık, Senelik
    taksit_sayisi = Column(Integer, default=1) # 1-6 taksit
    taksit_no = Column(Integer, default=1) # 1, 2, 3...
    aciklama = Column(String, nullable=True) # "1. Taksit", "4 Hafta Sonraki Ödeme" vb.
    sinif_adi = Column(String, nullable=True)
    akademi_adi = Column(String, nullable=True, default="Test1", index=True)

    # İlişkiler
    ogrenci = relationship("Ogrenci", back_populates="odemeler")

class Yoklama(Base):
    __tablename__ = "yoklamalar"

    id = Column(Integer, primary_key=True, index=True)
    ogrenci_id = Column(Integer, ForeignKey("ogrenciler.id"))
    sinif_id = Column(Integer, ForeignKey("siniflar.id"))
    tarih = Column(DateTime, default=datetime.utcnow)
    durum = Column(String) # Geldi, Gelmedi, Mazeret
    aciklama = Column(String, nullable=True) # Mazeret açıklaması
    akademi_adi = Column(String, nullable=True, default="Test1", index=True)

    # İlişkiler
    ogrenci = relationship("Ogrenci", back_populates="yoklamalar")
    sinif = relationship("Sinif", back_populates="yoklamalar")

class DersProgrami(Base):
    __tablename__ = "ders_programi"

    id = Column(Integer, primary_key=True, index=True)
    sinif_id = Column(Integer, ForeignKey("siniflar.id"), nullable=False)
    gun = Column(String, nullable=False) # Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar
    baslangic_saati = Column(String, nullable=False) # örn: "10:00"
    bitis_saati = Column(String, nullable=False) # örn: "11:30"
    ders_adi = Column(String, nullable=True)
    ogretmen_adi = Column(String, nullable=True)
    renk = Column(String, default="indigo")

    # İlişkiler
    sinif = relationship("Sinif")


class OnKayit(Base):
    __tablename__ = "on_kayitlar"

    id = Column(Integer, primary_key=True, index=True)
    ogrenci_adi = Column(String, nullable=False)
    ogrenci_soyadi = Column(String, nullable=False)
    veli_adi = Column(String, nullable=True)
    veli_soyadi = Column(String, nullable=True)
    veli_meslek = Column(String, nullable=True)
    telefon = Column(String, nullable=True, index=True)
    ilgilenilen_brans = Column(String, nullable=True) # Sınıflar tablosu ile FK OLMAYACAK, serbest metin
    durum = Column(String, default="Aranacak") # Aranacak, Arandı, Ulaşılamadı, Olumsuz, Kesin Kayıt
    akademi_adi = Column(String, nullable=True, default="Test1", index=True)
    notlar = Column(String, nullable=True)
    eklenme_tarihi = Column(DateTime, default=datetime.utcnow)

class Akademi(Base):
    __tablename__ = "akademiler"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    eklenme_tarihi = Column(DateTime, default=datetime.utcnow)


class Kullanici(Base):
    __tablename__ = "kullanicilar"

    id = Column(Integer, primary_key=True, index=True)
    kullanici_adi = Column(String, unique=True, index=True, nullable=False)
    sifre = Column(String, nullable=False)
    rol = Column(String, nullable=False, default="Personel") # Yönetici, Personel
    ad_soyad = Column(String, nullable=True)
    akademi_adi = Column(String, nullable=True, default="Test1")
    eklenme_tarihi = Column(DateTime, default=datetime.utcnow)