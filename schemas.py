from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ==================== SINIF SCHEMAS ====================
class SinifBase(BaseModel):
    sinif_adi: str
    kapasite: int = 20

class SinifCreate(SinifBase):
    gun: Optional[str] = None
    baslangic_saati: Optional[str] = None
    bitis_saati: Optional[str] = None
    ders_adi: Optional[str] = None
    ogretmen_adi: Optional[str] = None
    renk: Optional[str] = "indigo"

class SinifResponse(SinifBase):
    id: int
    ogrenci_sayisi: Optional[int] = 0
    ders_programi: Optional[List['DersProgramiResponse']] = []

    model_config = ConfigDict(from_attributes=True)


# ==================== OGRENCI SINIF SCHEMAS ====================
class OgrenciSinifCreate(BaseModel):
    ogrenci_id: int
    sinif_id: Optional[int] = None
    sinif_adi: Optional[str] = None
    kalan_ders_hakki: int = 0

class OgrenciSinifResponse(BaseModel):
    id: int
    ogrenci_id: int
    sinif_id: int
    kalan_ders_hakki: int
    sinif_adi: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== OGRENCI SCHEMAS ====================
class OgrenciBase(BaseModel):
    isim: str
    soyisim: str
    tc: Optional[str] = None
    telefon: Optional[str] = None
    eposta: Optional[str] = None
    adres: Optional[str] = None
    durum: Optional[str] = "Aktif"
    
    anne_isim: Optional[str] = None
    anne_tc: Optional[str] = None
    anne_telefon: Optional[str] = None
    anne_eposta: Optional[str] = None
    anne_meslek: Optional[str] = None
    
    baba_isim: Optional[str] = None
    baba_tc: Optional[str] = None
    baba_telefon: Optional[str] = None
    baba_eposta: Optional[str] = None
    baba_meslek: Optional[str] = None

class OgrenciCreate(OgrenciBase):
    sinif_adi: Optional[str] = None
    bakiye: float = 0.0

class OgrenciResponse(OgrenciBase):
    id: int
    bakiye: float
    durum: Optional[str] = "Aktif"
    kayit_tarihi: Optional[datetime] = None
    son_odeme_tarihi: Optional[datetime] = None
    gecikmis_odeme_var_mi: Optional[bool] = False
    en_yakin_vade_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== ODEME SCHEMAS ====================
class OdemeCreate(BaseModel):
    ogrenci_id: int
    tutar: float
    odeme_yontemi: Optional[str] = "Nakit"
    durum: Optional[str] = "Ödendi"
    odeme_periyodu: Optional[str] = "Aylık"
    taksit_sayisi: Optional[int] = 1
    tarih: Optional[str] = None
    eklenecek_ders_hakki: Optional[int] = 0
    sinif_id: Optional[int] = None
    sinif_adi: Optional[str] = None
    taksit_tarihleri: Optional[List[str]] = None
    taksit_tutar_listesi: Optional[List[float]] = None
    aciklama: Optional[str] = None

class OdemeResponse(BaseModel):
    id: int
    ogrenci_id: int
    tutar: float
    tarih: Optional[datetime] = None
    odeme_yontemi: Optional[str] = None
    durum: Optional[str] = None
    odeme_periyodu: Optional[str] = "Aylık"
    taksit_sayisi: Optional[int] = 1
    taksit_no: Optional[int] = 1
    aciklama: Optional[str] = None
    sinif_adi: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class OdemeTahsilatCreate(BaseModel):
    odeme_yontemi: Optional[str] = "Nakit"
    tarih: Optional[str] = None
    aciklama: Optional[str] = None

class OdemeUpdate(BaseModel):
    tutar: Optional[float] = None
    tarih: Optional[str] = None
    odeme_yontemi: Optional[str] = None
    aciklama: Optional[str] = None
    durum: Optional[str] = None


# ==================== ÖN KAYIT SCHEMAS ====================
class OnKayitBase(BaseModel):
    ogrenci_adi: str
    ogrenci_soyadi: str
    veli_adi: Optional[str] = None
    veli_soyadi: Optional[str] = None
    veli_meslek: Optional[str] = None
    telefon: Optional[str] = None
    ilgilenilen_brans: Optional[str] = None
    durum: Optional[str] = "Aranacak"

class OnKayitCreate(OnKayitBase):
    pass

class OnKayitDurumUpdate(BaseModel):
    durum: str

class OnKayitResponse(OnKayitBase):
    id: int
    eklenme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== AKADEMİ SCHEMAS ====================
class AkademiBase(BaseModel):
    name: str

class AkademiCreate(AkademiBase):
    pass

class AkademiKurulumCreate(BaseModel):
    akademi_adi: str
    ad_soyad: Optional[str] = None
    kullanici_adi: str
    sifre: str

class AkademiResponse(AkademiBase):
    id: int
    eklenme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== KULLANICI SCHEMAS ====================
class KullaniciBase(BaseModel):
    kullanici_adi: str
    rol: Optional[str] = "Personel"
    ad_soyad: Optional[str] = None
    akademi_adi: Optional[str] = "Test1"

class KullaniciCreate(KullaniciBase):
    sifre: str

class KullaniciLogin(BaseModel):
    kullanici_adi: str
    sifre: str
    akademi_adi: Optional[str] = "Test1"

class KullaniciResponse(KullaniciBase):
    id: int
    eklenme_tarihi: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: KullaniciResponse

    model_config = ConfigDict(from_attributes=True)


# ==================== DERS PROGRAMI SCHEMAS ====================
class DersProgramiBase(BaseModel):
    sinif_id: int
    gun: str
    baslangic_saati: str
    bitis_saati: str
    ders_adi: Optional[str] = None
    ogretmen_adi: Optional[str] = None
    renk: Optional[str] = "indigo"

class DersProgramiCreate(DersProgramiBase):
    pass

class DersProgramiResponse(DersProgramiBase):
    id: int
    sinif_adi: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==================== YOKLAMA SCHEMAS ====================
class YoklamaItem(BaseModel):
    ogrenci_id: int
    durum: str # Geldi, Gelmedi, Mazeret
    aciklama: Optional[str] = None

class YoklamaSaveRequest(BaseModel):
    sinif_id: int
    tarih: str # YYYY-MM-DD
    yoklamalar: List[YoklamaItem]

class YoklamaResponse(BaseModel):
    id: int
    ogrenci_id: int
    sinif_id: int
    tarih: Optional[datetime] = None
    durum: str
    aciklama: Optional[str] = None
    ogrenci_adi: Optional[str] = None
    sinif_adi: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


