import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Query, Body, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import or_, text
from sqlalchemy.orm import Session, joinedload
import jwt
from passlib.context import CryptContext
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from database import engine, SessionLocal
import models
import schemas

# Veritabanı tablolarını oluştur
models.Base.metadata.create_all(bind=engine)

import bcrypt

# Password Hashing Setup (Native Bcrypt)
def hash_password(password: str) -> str:
    if not password:
        password = ""
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            pwd_bytes = (plain_password or "").encode('utf-8')[:72]
            return bcrypt.checkpw(pwd_bytes, hashed_password.encode('utf-8'))
        except Exception:
            return False
    return plain_password == hashed_password

# JWT Setup
security_scheme = HTTPBearer(auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def auto_migrate():
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS tc VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS anne_isim VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS anne_tc VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS anne_meslek VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS baba_isim VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS baba_tc VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS baba_meslek VARCHAR;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS durum VARCHAR DEFAULT 'Aktif';"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS kayit_tarihi TIMESTAMP;"))
            conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN IF NOT EXISTS akademi_adi VARCHAR DEFAULT 'Test1';"))
            
            conn.execute(text("ALTER TABLE on_kayitlar ADD COLUMN IF NOT EXISTS veli_meslek VARCHAR;"))
            conn.execute(text("ALTER TABLE on_kayitlar ADD COLUMN IF NOT EXISTS akademi_adi VARCHAR DEFAULT 'Test1';"))
            
            conn.execute(text("ALTER TABLE siniflar ADD COLUMN IF NOT EXISTS akademi_adi VARCHAR DEFAULT 'Test1';"))
            
            conn.execute(text("ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS odeme_periyodu VARCHAR;"))
            conn.execute(text("ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS taksit_sayisi INTEGER;"))
            conn.execute(text("ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS taksit_no INTEGER DEFAULT 1;"))
            conn.execute(text("ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS aciklama VARCHAR;"))
            conn.execute(text("ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS sinif_adi VARCHAR;"))
            conn.execute(text("ALTER TABLE odemeler ADD COLUMN IF NOT EXISTS akademi_adi VARCHAR DEFAULT 'Test1';"))
            
            conn.execute(text("ALTER TABLE yoklamalar ADD COLUMN IF NOT EXISTS aciklama VARCHAR;"))
            conn.execute(text("ALTER TABLE yoklamalar ADD COLUMN IF NOT EXISTS akademi_adi VARCHAR DEFAULT 'Test1';"))
            
            conn.execute(text("ALTER TABLE kullanicilar ADD COLUMN IF NOT EXISTS akademi_adi VARCHAR DEFAULT 'Test1';"))
            
            cols = ["anne_telefon", "anne_isim", "anne_tc", "anne_eposta", "anne_meslek",
                    "baba_telefon", "baba_isim", "baba_tc", "baba_eposta", "baba_meslek",
                    "tc", "telefon", "eposta", "adres"]
            for col in cols:
                try:
                    conn.execute(text(f"ALTER TABLE ogrenciler ALTER COLUMN {col} DROP NOT NULL;"))
                except Exception:
                    pass
            try:
                conn.execute(text("DROP INDEX IF EXISTS ix_ogrenciler_telefon;"))
            except Exception:
                pass
            conn.commit()
    except Exception as e:
        print("Otomatik migrasyon uyarısı:", e)

auto_migrate()

def seed_initial_user():
    try:
        db = SessionLocal()
        test1 = db.query(models.Akademi).filter(models.Akademi.name == "Test1").first()
        if not test1:
            test1 = models.Akademi(name="Test1")
            db.add(test1)
            db.commit()

        test2 = db.query(models.Akademi).filter(models.Akademi.name == "Test2").first()
        if not test2:
            test2 = models.Akademi(name="Test2")
            db.add(test2)
            db.commit()

        admin_user = db.query(models.Kullanici).filter(models.Kullanici.kullanici_adi == "doruk").first()
        if not admin_user:
            admin_user = models.Kullanici(
                kullanici_adi="doruk",
                sifre=hash_password("1111"),
                rol="Yönetici",
                ad_soyad="Doruk (Yönetici)",
                akademi_adi="Test1"
            )
            db.add(admin_user)
            db.commit()
            print("İlk yönetici kullanıcısı (doruk / 1111 - Test1) oluşturuldu.")
        else:
            if not admin_user.akademi_adi:
                admin_user.akademi_adi = "Test1"
            if not (admin_user.sifre.startswith("$2b$") or admin_user.sifre.startswith("$2a$")):
                admin_user.sifre = hash_password("1111")
            db.commit()
        db.close()
    except Exception as e:
        print("Kullanıcı seed uyarısı:", e)

seed_initial_user()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Akademi Otomasyonu API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware ile dinamik ALLOWED_ORIGINS allow-list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Veritabanı oturum yönetimi (Session)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> models.Kullanici:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum açmanız gerekmektedir (Token bulunamadı).",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        token_akademi: Optional[str] = payload.get("akademi_adi")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz yetkilendirme token'ı.",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş oturum token'ı.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(models.Kullanici).filter(models.Kullanici.kullanici_adi == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if token_akademi:
        db.expunge(user)
        user.akademi_adi = token_akademi
    return user


dist_path = os.path.join(os.path.dirname(__file__), "frontend", "dist")
assets_path = os.path.join(dist_path, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

@app.get("/")
@app.get("/login", response_class=HTMLResponse)
@app.get("/dashboard", response_class=HTMLResponse)
@app.get("/kayit", response_class=HTMLResponse)
@app.get("/on-kayit", response_class=HTMLResponse)
@app.get("/yoklama", response_class=HTMLResponse)
@app.get("/finans", response_class=HTMLResponse)
@app.get("/kullanicilar", response_class=HTMLResponse)
def get_dashboard():
    dist_index = os.path.join(dist_path, "index.html")
    if os.path.exists(dist_index):
        with open(dist_index, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    dashboard_path = os.path.join(os.path.dirname(__file__), "dashboard.html")
    if os.path.exists(dashboard_path):
        with open(dashboard_path, "r", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    return HTMLResponse("<h2>Dashboard dosyası bulunamadı.</h2>", status_code=404)


# ==================== ÖĞRENCİ ENDPOINTLERİ ====================
@app.post("/ogrenciler/", response_model=schemas.OgrenciResponse, status_code=status.HTTP_201_CREATED)
def create_ogrenci(
    ogrenci: schemas.OgrenciCreate = Depends(), 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    # Boş veya sadece boşluktan oluşan metin alanlarını temizleme
    telefon = ogrenci.telefon.strip() if ogrenci.telefon and ogrenci.telefon.strip() else None
    eposta = ogrenci.eposta.strip() if ogrenci.eposta and ogrenci.eposta.strip() else None
    tc = ogrenci.tc.strip() if ogrenci.tc and ogrenci.tc.strip() else None
    adres = ogrenci.adres.strip() if ogrenci.adres and ogrenci.adres.strip() else None

    anne_isim = ogrenci.anne_isim.strip() if ogrenci.anne_isim and ogrenci.anne_isim.strip() else None
    anne_tc = ogrenci.anne_tc.strip() if ogrenci.anne_tc and ogrenci.anne_tc.strip() else None
    anne_telefon = ogrenci.anne_telefon.strip() if ogrenci.anne_telefon and ogrenci.anne_telefon.strip() else None
    anne_eposta = ogrenci.anne_eposta.strip() if ogrenci.anne_eposta and ogrenci.anne_eposta.strip() else None
    anne_meslek = ogrenci.anne_meslek.strip() if ogrenci.anne_meslek and ogrenci.anne_meslek.strip() else None

    baba_isim = ogrenci.baba_isim.strip() if ogrenci.baba_isim and ogrenci.baba_isim.strip() else None
    baba_tc = ogrenci.baba_tc.strip() if ogrenci.baba_tc and ogrenci.baba_tc.strip() else None
    baba_telefon = ogrenci.baba_telefon.strip() if ogrenci.baba_telefon and ogrenci.baba_telefon.strip() else None
    baba_eposta = ogrenci.baba_eposta.strip() if ogrenci.baba_eposta and ogrenci.baba_eposta.strip() else None
    baba_meslek = ogrenci.baba_meslek.strip() if ogrenci.baba_meslek and ogrenci.baba_meslek.strip() else None

    # Sınıf kontrolü (seçilen var olan sınıfı veritabanında bul)
    sinif_adi = ogrenci.sinif_adi.strip() if ogrenci.sinif_adi and ogrenci.sinif_adi.strip() else None
    db_sinif = None
    if sinif_adi:
        db_sinif = db.query(models.Sinif).filter(models.Sinif.sinif_adi == sinif_adi).first()


    # Yeni öğrenci nesnesini oluştur ve ekle
    yeni_ogrenci = models.Ogrenci(
        isim=ogrenci.isim,
        soyisim=ogrenci.soyisim,
        tc=tc,
        dogum_tarihi=ogrenci.dogum_tarihi,
        telefon=telefon,
        eposta=eposta,
        adres=adres,
        anne_isim=anne_isim,
        anne_tc=anne_tc,
        anne_telefon=anne_telefon,
        anne_eposta=anne_eposta,
        anne_meslek=anne_meslek,
        baba_isim=baba_isim,
        baba_tc=baba_tc,
        baba_telefon=baba_telefon,
        baba_eposta=baba_eposta,
        baba_meslek=baba_meslek,
        bakiye=ogrenci.bakiye,
        durum=ogrenci.durum or "Aktif",
        akademi_adi=current_user.akademi_adi or "Test1"
    )
    db.add(yeni_ogrenci)
    try:
        db.commit()
        db.refresh(yeni_ogrenci)
    except Exception as e:
        db.rollback()
        err_msg = str(e)
        if "telefon" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"'{telefon}' telefon numarasına sahip bir öğrenci zaten mevcut.")
        if "tc" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"'{tc}' TC kimlik numarasına sahip bir öğrenci zaten mevcut.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Öğrenci veritabanına eklenirken bir hata oluştu.")

    # Sınıf seçildiyse OgrenciSinif tablosuna ders hakkı 0 olacak şekilde ilişkisini ekle
    if db_sinif:
        ogrenci_sinif = models.OgrenciSinif(
            ogrenci_id=yeni_ogrenci.id,
            sinif_id=db_sinif.id,
            kalan_ders_hakki=0
        )
        db.add(ogrenci_sinif)
        try:
            db.commit()
            db.refresh(yeni_ogrenci)
        except Exception:
            db.rollback()

    return yeni_ogrenci


@app.get("/ogrenciler/", response_model=List[schemas.OgrenciResponse])
def get_ogrenciler(
    durum: Optional[str] = Query(None), 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Ogrenci).options(joinedload(models.Ogrenci.odemeler))
    if current_user.akademi_adi:
        query = query.filter(models.Ogrenci.akademi_adi == current_user.akademi_adi)
    if durum:
        query = query.filter(models.Ogrenci.durum == durum)
    ogrenciler = query.all()
    return [schemas.OgrenciResponse.model_validate(o) for o in ogrenciler]


@app.put("/ogrenciler/{ogrenci_id}", response_model=schemas.OgrenciResponse)
def update_ogrenci(
    ogrenci_id: int,
    ogrenci_data: schemas.OgrenciUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == ogrenci_id).first()
    if not ogrenci or (ogrenci.akademi_adi != current_user.akademi_adi):
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    
    update_data = ogrenci_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ogrenci, key, value)
        
    db.commit()
    db.refresh(ogrenci)
    return ogrenci


@app.put("/ogrenciler/{ogrenci_id}/durum", response_model=schemas.OgrenciResponse)
def update_ogrenci_durum(
    ogrenci_id: int,
    durum: Optional[str] = Query(None),
    durum_data: Optional[schemas.OnKayitDurumUpdate] = None,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    target_durum = durum
    if not target_durum and durum_data and durum_data.durum:
        target_durum = durum_data.durum
    if not target_durum:
        target_durum = "Pasif"

    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == ogrenci_id).first()
    if not ogrenci:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı.")

    ogrenci.durum = target_durum
    db.commit()
    db.refresh(ogrenci)
    return ogrenci


@app.get("/ogrenciler/ara", response_model=List[schemas.OgrenciResponse])
def ara_ogrenci(
    q: str = Query(..., description="İsim, soyisim, TC veya telefon ile arama yapın"), 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    search_term = f"%{q.strip()}%"
    query = db.query(models.Ogrenci)
    if current_user.akademi_adi:
        query = query.filter(models.Ogrenci.akademi_adi == current_user.akademi_adi)
    results = query.filter(
        or_(
            models.Ogrenci.isim.ilike(search_term),
            models.Ogrenci.soyisim.ilike(search_term),
            models.Ogrenci.telefon.ilike(search_term),
            models.Ogrenci.tc.ilike(search_term),
            models.Ogrenci.anne_isim.ilike(search_term),
            models.Ogrenci.baba_isim.ilike(search_term)
        )
    ).all()
    return results


@app.get("/ogrenciler/{ogrenci_id}", response_model=schemas.OgrenciResponse)
def get_ogrenci_by_id(
    ogrenci_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == ogrenci_id).first()
    if not ogrenci:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı.")
    return ogrenci


@app.delete("/ogrenciler/{ogrenci_id}", status_code=status.HTTP_200_OK)
def delete_ogrenci(
    ogrenci_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == ogrenci_id).first()
    if not ogrenci:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı.")

    # İlişkili kayıtları temizle
    db.query(models.OgrenciSinif).filter(models.OgrenciSinif.ogrenci_id == ogrenci_id).delete()
    db.query(models.Odeme).filter(models.Odeme.ogrenci_id == ogrenci_id).delete()
    db.query(models.Yoklama).filter(models.Yoklama.ogrenci_id == ogrenci_id).delete()

    db.delete(ogrenci)
    db.commit()
    return {"mesaj": "Öğrenci başarıyla silindi."}


@app.get("/ogrenciler/{ogrenci_id}/siniflar/", response_model=List[schemas.OgrenciSinifResponse])
def get_ogrenci_siniflar(
    ogrenci_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == ogrenci_id).first()
    if not ogrenci:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı.")

    ogrenci_siniflar = db.query(models.OgrenciSinif).filter(models.OgrenciSinif.ogrenci_id == ogrenci_id).all()
    
    res = []
    for item in ogrenci_siniflar:
        sinif_adi = item.sinif.sinif_adi if item.sinif else None
        res.append(schemas.OgrenciSinifResponse(
            id=item.id,
            ogrenci_id=item.ogrenci_id,
            sinif_id=item.sinif_id,
            kalan_ders_hakki=item.kalan_ders_hakki,
            sinif_adi=sinif_adi
        ))
    return res


# ==================== ÖĞRENCİ-SINIF (ÇOKLU DERS/KURS KAYDI) ====================
@app.post("/ogrenci-sinif/", response_model=schemas.OgrenciSinifResponse, status_code=status.HTTP_201_CREATED)
def kaydet_ogrenci_sinif(
    data: schemas.OgrenciSinifCreate = Depends(), 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    # Öğrenci var mı kontrol et
    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == data.ogrenci_id).first()
    if not ogrenci:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı.")

    # Sınıfı bul veya oluştur
    db_sinif = None
    if data.sinif_id:
        db_sinif = db.query(models.Sinif).filter(models.Sinif.id == data.sinif_id).first()
        if not db_sinif:
            raise HTTPException(status_code=404, detail="Belirtilen sınıf ID bulunamadı.")
    elif data.sinif_adi and data.sinif_adi.strip():
        sinif_name = data.sinif_adi.strip()
        db_sinif = db.query(models.Sinif).filter(models.Sinif.sinif_adi == sinif_name).first()
        if not db_sinif:
            db_sinif = models.Sinif(sinif_adi=sinif_name, kapasite=20)
            db.add(db_sinif)
            db.commit()
            db.refresh(db_sinif)
    else:
        raise HTTPException(status_code=400, detail="Lütfen bir sınıf ID'si veya sınıf adı giriniz.")

    # Öğrencinin bu sınıfa kaydı var mı bak
    ogrenci_sinif = db.query(models.OgrenciSinif).filter(
        models.OgrenciSinif.ogrenci_id == ogrenci.id,
        models.OgrenciSinif.sinif_id == db_sinif.id
    ).first()

    if not ogrenci_sinif:
        ogrenci_sinif = models.OgrenciSinif(
            ogrenci_id=ogrenci.id,
            sinif_id=db_sinif.id,
            kalan_ders_hakki=data.kalan_ders_hakki
        )
        db.add(ogrenci_sinif)
    else:
        ogrenci_sinif.kalan_ders_hakki += data.kalan_ders_hakki

    db.commit()
    db.refresh(ogrenci_sinif)

    return schemas.OgrenciSinifResponse(
        id=ogrenci_sinif.id,
        ogrenci_id=ogrenci_sinif.ogrenci_id,
        sinif_id=ogrenci_sinif.sinif_id,
        kalan_ders_hakki=ogrenci_sinif.kalan_ders_hakki,
        sinif_adi=db_sinif.sinif_adi
    )

@app.delete("/ogrenci-sinif/{id}", status_code=status.HTTP_200_OK)
def delete_ogrenci_sinif(
    id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    rec = db.query(models.OgrenciSinif).filter(models.OgrenciSinif.id == id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Öğrenci ders kaydı bulunamadı.")
    db.delete(rec)
    db.commit()
    return {"mesaj": "Öğrenci dersten başarıyla çıkarıldı."}


# ==================== SINIF ENDPOINTLERİ ====================
@app.post("/siniflar/", response_model=schemas.SinifResponse, status_code=status.HTTP_201_CREATED)
def create_sinif(
    sinif_body: Optional[schemas.SinifCreate] = Body(None),
    sinif_adi: Optional[str] = Query(None),
    kapasite: Optional[int] = Query(20),
    gun: Optional[str] = Query(None),
    baslangic_saati: Optional[str] = Query(None),
    bitis_saati: Optional[str] = Query(None),
    ders_adi: Optional[str] = Query(None),
    ogretmen_adi: Optional[str] = Query(None),
    renk: Optional[str] = Query("indigo"),
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    if sinif_body is not None:
        sinif = sinif_body
    else:
        if not sinif_adi:
            raise HTTPException(status_code=400, detail="Sınıf adı zorunludur.")
        sinif = schemas.SinifCreate(
            sinif_adi=sinif_adi,
            kapasite=kapasite or 20,
            gun=gun,
            baslangic_saati=baslangic_saati,
            bitis_saati=bitis_saati,
            ders_adi=ders_adi,
            ogretmen_adi=ogretmen_adi,
            renk=renk or "indigo"
        )

    db_sinif = models.Sinif(
        sinif_adi=sinif.sinif_adi.strip(),
        kapasite=sinif.kapasite or 20,
        akademi_adi=current_user.akademi_adi or "Test1"
    )
    db.add(db_sinif)
    db.commit()
    db.refresh(db_sinif)

    ders_programi_list = []

    # Eğer sınıf oluşturulurken gün ve saat atandıysa otomatik ders programı kaydı oluştur
    if sinif.gun and sinif.baslangic_saati and sinif.bitis_saati:
        yeni_ders = models.DersProgrami(
            sinif_id=db_sinif.id,
            gun=sinif.gun.strip(),
            baslangic_saati=sinif.baslangic_saati.strip(),
            bitis_saati=sinif.bitis_saati.strip(),
            ders_adi=sinif.ders_adi.strip() if sinif.ders_adi else db_sinif.sinif_adi,
            ogretmen_adi=sinif.ogretmen_adi.strip() if sinif.ogretmen_adi else None,
            renk=sinif.renk or "indigo"
        )
        db.add(yeni_ders)
        db.commit()
        db.refresh(yeni_ders)

        ders_programi_list.append(schemas.DersProgramiResponse(
            id=yeni_ders.id,
            sinif_id=yeni_ders.sinif_id,
            gun=yeni_ders.gun,
            baslangic_saati=yeni_ders.baslangic_saati,
            bitis_saati=yeni_ders.bitis_saati,
            ders_adi=yeni_ders.ders_adi,
            ogretmen_adi=yeni_ders.ogretmen_adi,
            renk=yeni_ders.renk,
            sinif_adi=db_sinif.sinif_adi
        ))

    return schemas.SinifResponse(
        id=db_sinif.id,
        sinif_adi=db_sinif.sinif_adi,
        kapasite=db_sinif.kapasite,
        ogrenci_sayisi=0,
        ders_programi=ders_programi_list
    )


@app.get("/siniflar/", response_model=List[schemas.SinifResponse])
def get_siniflar(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Sinif)
    if current_user.akademi_adi:
        query = query.filter(models.Sinif.akademi_adi == current_user.akademi_adi)
    siniflar = query.all()
    res = []
    for s in siniflar:
        count = db.query(models.OgrenciSinif).filter(models.OgrenciSinif.sinif_id == s.id).count()
        program_items = db.query(models.DersProgrami).filter(models.DersProgrami.sinif_id == s.id).all()
        prog_list = []
        for p in program_items:
            prog_list.append(schemas.DersProgramiResponse(
                id=p.id,
                sinif_id=p.sinif_id,
                gun=p.gun,
                baslangic_saati=p.baslangic_saati,
                bitis_saati=p.bitis_saati,
                ders_adi=p.ders_adi,
                ogretmen_adi=p.ogretmen_adi,
                renk=p.renk or "indigo",
                sinif_adi=s.sinif_adi
            ))

        res.append(schemas.SinifResponse(
            id=s.id,
            sinif_adi=s.sinif_adi,
            kapasite=s.kapasite,
            ogrenci_sayisi=count,
            ders_programi=prog_list
        ))
    return res


@app.get("/siniflar/{sinif_id}/ogrenciler/")
def get_sinif_ogrencileri(
    sinif_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    sinif = db.query(models.Sinif).filter(models.Sinif.id == sinif_id).first()
    if not sinif:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı.")

    ogrenci_siniflar = db.query(models.OgrenciSinif).filter(models.OgrenciSinif.sinif_id == sinif_id).all()

    ogrenciler = []
    for item in ogrenci_siniflar:
        ogrenci = item.ogrenci
        if ogrenci:
            ogrenciler.append({
                "ogrenci_id": ogrenci.id,
                "isim": ogrenci.isim,
                "soyisim": ogrenci.soyisim,
                "tc": ogrenci.tc,
                "telefon": ogrenci.telefon,
                "eposta": ogrenci.eposta,
                "anne_isim": ogrenci.anne_isim,
                "anne_telefon": ogrenci.anne_telefon,
                "baba_isim": ogrenci.baba_isim,
                "baba_telefon": ogrenci.baba_telefon,
                "kalan_ders_hakki": item.kalan_ders_hakki
            })

    return {
        "sinif_id": sinif.id,
        "sinif_adi": sinif.sinif_adi,
        "ogrenci_sayisi": len(ogrenciler),
        "ogrenciler": ogrenciler
    }


@app.delete("/siniflar/{sinif_id}", status_code=status.HTTP_200_OK)
def delete_sinif(
    sinif_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    sinif = db.query(models.Sinif).filter(models.Sinif.id == sinif_id).first()
    if not sinif:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı.")

    # İlişkili OgrenciSinif ve Yoklama kayıtlarını sil
    db.query(models.OgrenciSinif).filter(models.OgrenciSinif.sinif_id == sinif_id).delete()
    db.query(models.Yoklama).filter(models.Yoklama.sinif_id == sinif_id).delete()

    db.delete(sinif)
    db.commit()
    return {"mesaj": "Sınıf başarıyla silindi."}


# ==================== ÖDEME (FİNANS) ENDPOINTLERİ ====================
@app.get("/odemeler/", response_model=List[schemas.OdemeResponse])
def get_odemeler(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Odeme)
    if current_user.akademi_adi:
        query = query.filter(models.Odeme.akademi_adi == current_user.akademi_adi)
    return query.order_by(models.Odeme.tarih.desc()).all()


@app.get("/odemeler-list/", response_model=List[schemas.OdemeResponse])
def get_odemeler_list(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Odeme)
    if current_user.akademi_adi:
        query = query.filter(models.Odeme.akademi_adi == current_user.akademi_adi)
    return query.order_by(models.Odeme.tarih.desc()).all()


@app.post("/odemeler/", response_model=schemas.OdemeResponse, status_code=status.HTTP_201_CREATED)
def create_odeme(
    odeme_body: Optional[schemas.OdemeCreate] = Body(None),
    ogrenci_id: Optional[int] = Query(None),
    tutar: Optional[float] = Query(None),
    odeme_yontemi: Optional[str] = Query("Nakit"),
    durum: Optional[str] = Query("Ödendi"),
    odeme_periyodu: Optional[str] = Query("Aylık"),
    taksit_sayisi: Optional[int] = Query(1),
    tarih: Optional[str] = Query(None),
    eklenecek_ders_hakki: Optional[int] = Query(0),
    sinif_id: Optional[int] = Query(None),
    sinif_adi: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    if odeme_body is not None:
        odeme = odeme_body
    else:
        if ogrenci_id is None or tutar is None:
            raise HTTPException(status_code=400, detail="Öğrenci ID ve tutar girilmesi zorunludur.")
        odeme = schemas.OdemeCreate(
            ogrenci_id=ogrenci_id,
            tutar=tutar,
            odeme_yontemi=odeme_yontemi,
            durum=durum,
            odeme_periyodu=odeme_periyodu,
            taksit_sayisi=taksit_sayisi,
            tarih=tarih,
            eklenecek_ders_hakki=eklenecek_ders_hakki or 0,
            sinif_id=sinif_id,
            sinif_adi=sinif_adi
        )

    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == odeme.ogrenci_id).first()
    if not ogrenci:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Öğrenci bulunamadı.")

    def parse_date_str(d_str):
        if not d_str or not d_str.strip():
            return datetime.utcnow()
        try:
            s = d_str.strip()
            if len(s) == 10:
                return datetime.strptime(s, "%Y-%m-%d")
            return datetime.fromisoformat(s)
        except Exception:
            return datetime.utcnow()

    tarih_val = parse_date_str(odeme.tarih)
    ilk_odeme = None

    # Taksitli Ödeme Mantığı (taksit_sayisi > 1)
    if odeme.taksit_sayisi and odeme.taksit_sayisi > 1:
        taksit_adedi = odeme.taksit_sayisi
        tutar_per_taksit = round(odeme.tutar / taksit_adedi, 2)
        
        tarih_listesi = odeme.taksit_tarihleri or []
        tutar_listesi = odeme.taksit_tutar_listesi or []

        for i in range(taksit_adedi):
            cur_tutar = tutar_listesi[i] if i < len(tutar_listesi) else tutar_per_taksit
            if i < len(tarih_listesi):
                cur_tarih = parse_date_str(tarih_listesi[i])
            else:
                cur_tarih = tarih_val + timedelta(days=30 * i)

            if i == 0:
                # 1. Taksit -> Tahsil Edildi
                cur_durum = odeme.durum or "Ödendi"
                cur_aciklama = odeme.aciklama or f"1. Taksit (1/{taksit_adedi})"
                ilk_odeme = models.Odeme(
                    ogrenci_id=odeme.ogrenci_id,
                    tutar=cur_tutar,
                    tarih=cur_tarih,
                    odeme_yontemi=odeme.odeme_yontemi,
                    durum=cur_durum,
                    odeme_periyodu=odeme.odeme_periyodu,
                    taksit_sayisi=taksit_adedi,
                    taksit_no=1,
                    aciklama=cur_aciklama,
                    sinif_adi=odeme.sinif_adi
                )
                db.add(ilk_odeme)
                if cur_durum == "Ödendi":
                    ogrenci.bakiye += cur_tutar
            else:
                # 2..N. Taksit -> Bekliyor (Alacak)
                gelelcekk_odeme = models.Odeme(
                    ogrenci_id=odeme.ogrenci_id,
                    tutar=cur_tutar,
                    tarih=cur_tarih,
                    odeme_yontemi=odeme.odeme_yontemi,
                    durum="Bekliyor",
                    odeme_periyodu=odeme.odeme_periyodu,
                    taksit_sayisi=taksit_adedi,
                    taksit_no=i + 1,
                    aciklama=f"{i + 1}. Taksit ({i + 1}/{taksit_adedi})",
                    sinif_adi=odeme.sinif_adi
                )
                db.add(gelelcekk_odeme)

    # Aylık Ödeme Mantığı (Aylık & 1 Taksit): Bugün ödendi + 4 Hafta (28 Gün) Sonrasına Gelecek Alacak Kaydı
    elif odeme.odeme_periyodu == "Aylık":
        cur_aciklama = odeme.aciklama or "Aylık Ödeme (Tahsil Edildi)"
        ilk_odeme = models.Odeme(
            ogrenci_id=odeme.ogrenci_id,
            tutar=odeme.tutar,
            tarih=tarih_val,
            odeme_yontemi=odeme.odeme_yontemi,
            durum=odeme.durum or "Ödendi",
            odeme_periyodu=odeme.odeme_periyodu,
            taksit_sayisi=1,
            taksit_no=1,
            aciklama=cur_aciklama,
            sinif_adi=odeme.sinif_adi
        )
        db.add(ilk_odeme)
        if (odeme.durum or "Ödendi") == "Ödendi":
            ogrenci.bakiye += odeme.tutar

        # 4 Hafta (28 Gün) Sonraki Gelecek Ödeme / Alacak Kaydı
        gelecek_tarih = tarih_val + timedelta(days=28)
        gelecek_alacak = models.Odeme(
            ogrenci_id=odeme.ogrenci_id,
            tutar=odeme.tutar,
            tarih=gelecek_tarih,
            odeme_yontemi=odeme.odeme_yontemi,
            durum="Bekliyor",
            odeme_periyodu=odeme.odeme_periyodu,
            taksit_sayisi=1,
            taksit_no=2,
            aciklama="4 Hafta Sonraki Ödeme (Alacak)",
            sinif_adi=odeme.sinif_adi
        )
        db.add(gelecek_alacak)

    # Senelik / Peşin Ödeme
    else:
        cur_aciklama = odeme.aciklama or "Peşin Ödeme"
        ilk_odeme = models.Odeme(
            ogrenci_id=odeme.ogrenci_id,
            tutar=odeme.tutar,
            tarih=tarih_val,
            odeme_yontemi=odeme.odeme_yontemi,
            durum=odeme.durum or "Ödendi",
            odeme_periyodu=odeme.odeme_periyodu,
            taksit_sayisi=1,
            taksit_no=1,
            aciklama=cur_aciklama,
            sinif_adi=odeme.sinif_adi
        )
        db.add(ilk_odeme)
        if (odeme.durum or "Ödendi") == "Ödendi":
            ogrenci.bakiye += odeme.tutar

    # Ders hakkı tanımı
    if odeme.eklenecek_ders_hakki > 0:
        target_sinif = None
        if odeme.sinif_id:
            target_sinif = db.query(models.Sinif).filter(models.Sinif.id == odeme.sinif_id).first()
        elif odeme.sinif_adi and odeme.sinif_adi.strip():
            s_name = odeme.sinif_adi.strip()
            target_sinif = db.query(models.Sinif).filter(models.Sinif.sinif_adi == s_name).first()
            if not target_sinif:
                target_sinif = models.Sinif(sinif_adi=s_name, kapasite=20)
                db.add(target_sinif)
                db.commit()
                db.refresh(target_sinif)

        if target_sinif:
            ogrenci_sinif = db.query(models.OgrenciSinif).filter(
                models.OgrenciSinif.ogrenci_id == ogrenci.id,
                models.OgrenciSinif.sinif_id == target_sinif.id
            ).first()
            if not ogrenci_sinif:
                ogrenci_sinif = models.OgrenciSinif(
                    ogrenci_id=ogrenci.id,
                    sinif_id=target_sinif.id,
                    kalan_ders_hakki=odeme.eklenecek_ders_hakki
                )
                db.add(ogrenci_sinif)
            else:
                ogrenci_sinif.kalan_ders_hakki += odeme.eklenecek_ders_hakki

    db.commit()
    if ilk_odeme:
        db.refresh(ilk_odeme)
        return ilk_odeme

    raise HTTPException(status_code=400, detail="Ödeme oluşturulamadı.")


@app.put("/odemeler/{odeme_id}/odendi", response_model=schemas.OdemeResponse)
def odeme_tahsil_et(
    odeme_id: int,
    tahsilat: Optional[schemas.OdemeTahsilatCreate] = Body(None),
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    odeme = db.query(models.Odeme).filter(models.Odeme.id == odeme_id).first()
    if not odeme:
        raise HTTPException(status_code=404, detail="Ödeme kaydı bulunamadı.")

    if odeme.durum == "Ödendi":
        raise HTTPException(status_code=400, detail="Bu ödeme zaten tahsil edilmiş.")

    # Orijinal tarihi sakla
    eski_tarih = odeme.tarih

    odeme.durum = "Ödendi"
    if tahsilat:
        if tahsilat.odeme_yontemi:
            odeme.odeme_yontemi = tahsilat.odeme_yontemi
        if tahsilat.aciklama is not None and tahsilat.aciklama.strip():
            odeme.aciklama = tahsilat.aciklama.strip()
        if tahsilat.tarih:
            try:
                t_str = tahsilat.tarih.strip()
                if len(t_str) == 10:
                    odeme.tarih = datetime.strptime(t_str, "%Y-%m-%d")
                else:
                    odeme.tarih = datetime.fromisoformat(t_str)
            except Exception:
                pass

    # Öğrencinin bakiyesini güncelle
    ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == odeme.ogrenci_id).first()
    if ogrenci:
        ogrenci.bakiye += odeme.tutar

    db.flush()

    # Aylık ödeme için 4 hafta sonraki ödeme alındı işaretlendiğinde o tarihten 4 hafta sonrası için tekrar alınacak ödeme oluştur
    if odeme.odeme_periyodu == "Aylık" and (not odeme.taksit_sayisi or odeme.taksit_sayisi <= 1):
        # Hesaplama tarihi: eski_tarih veya güncellenen ödeme tarihi baz alınır
        baz_tarih = eski_tarih if (eski_tarih and eski_tarih > odeme.tarih) else odeme.tarih
        yeni_tarih = baz_tarih + timedelta(days=28)

        # Bu ödeme DIŞINDA, gelecekte bekleyen/gecikmiş başka bir ödeme var mı kontrol et
        mevcut_gelecek = db.query(models.Odeme).filter(
            models.Odeme.ogrenci_id == odeme.ogrenci_id,
            models.Odeme.id != odeme.id,
            models.Odeme.durum.in_(["Bekliyor", "Gecikti"]),
            models.Odeme.tarih >= (odeme.tarih + timedelta(days=1))
        ).first()

        if not mevcut_gelecek:
            yeni_taksit_no = (odeme.taksit_no + 1) if odeme.taksit_no else 1
            yeni_gelecek_alacak = models.Odeme(
                ogrenci_id=odeme.ogrenci_id,
                tutar=odeme.tutar,
                tarih=yeni_tarih,
                odeme_yontemi=odeme.odeme_yontemi,
                durum="Bekliyor",
                odeme_periyodu="Aylık",
                taksit_sayisi=1,
                taksit_no=yeni_taksit_no,
                aciklama="4 Hafta Sonraki Ödeme (Alacak)",
                sinif_adi=odeme.sinif_adi
            )
            db.add(yeni_gelecek_alacak)

    db.commit()
    db.refresh(odeme)
    return odeme

@app.put("/odemeler/{odeme_id}/geri-al", response_model=schemas.OdemeResponse)
def odeme_geri_al(
    odeme_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    odeme = db.query(models.Odeme).filter(models.Odeme.id == odeme_id).first()
    if not odeme:
        raise HTTPException(status_code=404, detail="Ödeme kaydı bulunamadı.")

    if odeme.durum == "Ödendi":
        ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == odeme.ogrenci_id).first()
        if ogrenci:
            ogrenci.bakiye -= odeme.tutar
            if ogrenci.bakiye < 0:
                ogrenci.bakiye = 0.0

        odeme.durum = "Bekliyor"
        db.commit()
        db.refresh(odeme)

    return odeme


@app.put("/odemeler/{odeme_id}", response_model=schemas.OdemeResponse)
def update_odeme(
    odeme_id: int,
    odeme_update: schemas.OdemeUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    odeme = db.query(models.Odeme).filter(models.Odeme.id == odeme_id).first()
    if not odeme:
        raise HTTPException(status_code=404, detail="Ödeme kaydı bulunamadı.")

    if odeme_update.tutar is not None:
        if odeme.durum == "Ödendi":
            ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == odeme.ogrenci_id).first()
            if ogrenci:
                ogrenci.bakiye += (odeme_update.tutar - odeme.tutar)
        odeme.tutar = odeme_update.tutar

    if odeme_update.odeme_yontemi is not None:
        odeme.odeme_yontemi = odeme_update.odeme_yontemi

    if odeme_update.aciklama is not None:
        odeme.aciklama = odeme_update.aciklama.strip()

    if odeme_update.durum is not None:
        odeme.durum = odeme_update.durum

    if odeme_update.tarih:
        try:
            t_str = odeme_update.tarih.strip()
            if len(t_str) == 10:
                odeme.tarih = datetime.strptime(t_str, "%Y-%m-%d")
            else:
                odeme.tarih = datetime.fromisoformat(t_str)
        except Exception:
            pass

    db.commit()
    db.refresh(odeme)
    return odeme


@app.delete("/odemeler/{odeme_id}", status_code=status.HTTP_200_OK)
def delete_odeme(
    odeme_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    odeme = db.query(models.Odeme).filter(models.Odeme.id == odeme_id).first()
    if not odeme:
        raise HTTPException(status_code=404, detail="Ödeme kaydı bulunamadı.")

    if odeme.durum == "Ödendi":
        ogrenci = db.query(models.Ogrenci).filter(models.Ogrenci.id == odeme.ogrenci_id).first()
        if ogrenci:
            ogrenci.bakiye = max(0.0, ogrenci.bakiye - odeme.tutar)

    db.delete(odeme)
    db.commit()
    return {"mesaj": "Ödeme kaydı başarıyla silindi."}


# ==================== ÖN KAYIT ENDPOINTLERİ ====================
@app.get("/on-kayitlar/", response_model=List[schemas.OnKayitResponse])
def get_on_kayitlar(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.OnKayit)
    if current_user.akademi_adi:
        query = query.filter(models.OnKayit.akademi_adi == current_user.akademi_adi)
    return query.order_by(models.OnKayit.id.desc()).all()


@app.post("/on-kayitlar/", response_model=schemas.OnKayitResponse, status_code=status.HTTP_201_CREATED)
def create_on_kayit(
    on_kayit: schemas.OnKayitCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    yeni_kayit = models.OnKayit(
        ogrenci_adi=on_kayit.ogrenci_adi.strip(),
        ogrenci_soyadi=on_kayit.ogrenci_soyadi.strip(),
        veli_adi=on_kayit.veli_adi.strip() if on_kayit.veli_adi else None,
        veli_soyadi=on_kayit.veli_soyadi.strip() if on_kayit.veli_soyadi else None,
        veli_meslek=on_kayit.veli_meslek.strip() if on_kayit.veli_meslek else None,
        telefon=on_kayit.telefon.strip() if on_kayit.telefon else None,
        ilgilenilen_brans=on_kayit.ilgilenilen_brans.strip() if on_kayit.ilgilenilen_brans else None,
        notlar=on_kayit.notlar.strip() if on_kayit.notlar else None,
        durum=on_kayit.durum if on_kayit.durum else "Aranacak",
        akademi_adi=current_user.akademi_adi or "Test1"
    )
    db.add(yeni_kayit)
    db.commit()
    db.refresh(yeni_kayit)
    return yeni_kayit


@app.put("/on-kayitlar/{kayit_id}", response_model=schemas.OnKayitResponse)
def update_on_kayit(
    kayit_id: int,
    on_kayit_data: schemas.OnKayitUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    kayit = db.query(models.OnKayit).filter(models.OnKayit.id == kayit_id).first()
    if not kayit or (kayit.akademi_adi != current_user.akademi_adi):
        raise HTTPException(status_code=404, detail="Kayıt bulunamadı")
    
    update_data = on_kayit_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(kayit, key, value)
        
    db.commit()
    db.refresh(kayit)
    return kayit

@app.put("/on-kayitlar/{kayit_id}/durum", response_model=schemas.OnKayitResponse)
def update_on_kayit_durum(
    kayit_id: int,
    durum_data: schemas.OnKayitDurumUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    kayit = db.query(models.OnKayit).filter(models.OnKayit.id == kayit_id).first()
    if not kayit:
        raise HTTPException(status_code=404, detail="Ön kayıt bulunamadı.")
    
    kayit.durum = durum_data.durum
    db.commit()
    db.refresh(kayit)
    return kayit


@app.delete("/on-kayitlar/{kayit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_on_kayit(
    kayit_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    kayit = db.query(models.OnKayit).filter(models.OnKayit.id == kayit_id).first()
    if not kayit:
        raise HTTPException(status_code=404, detail="Ön kayıt bulunamadı.")
    db.delete(kayit)
    db.commit()
    return None


# ==================== AKADEMİ ENDPOINTLERİ ====================
@app.get("/akademiler/", response_model=List[schemas.AkademiResponse])
def get_akademiler(db: Session = Depends(get_db)):
    return db.query(models.Akademi).order_by(models.Akademi.id.asc()).all()

@app.get("/akademiler/detayli")
def get_akademiler_detayli(db: Session = Depends(get_db)):
    akademiler = db.query(models.Akademi).order_by(models.Akademi.id.asc()).all()
    result = []
    for ak in akademiler:
        admin_user = db.query(models.Kullanici).filter(
            models.Kullanici.akademi_adi == ak.name,
            models.Kullanici.rol == "Yönetici"
        ).first()
        user_count = db.query(models.Kullanici).filter(models.Kullanici.akademi_adi == ak.name).count()
        result.append({
            "id": ak.id,
            "name": ak.name,
            "eklenme_tarihi": ak.eklenme_tarihi,
            "admin_kullanici_adi": admin_user.kullanici_adi if admin_user else "Tanımsız",
            "admin_ad_soyad": admin_user.ad_soyad if admin_user else "-",
            "kullanici_sayisi": user_count
        })
    return result

@app.delete("/akademiler/{akademi_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_akademi(akademi_id: int, db: Session = Depends(get_db)):
    ak = db.query(models.Akademi).filter(models.Akademi.id == akademi_id).first()
    if not ak:
        raise HTTPException(status_code=404, detail="Akademi bulunamadı.")
    db.delete(ak)
    db.commit()
    return None

@app.post("/akademiler/", response_model=schemas.AkademiResponse, status_code=status.HTTP_201_CREATED)
def create_akademi(
    akademi: schemas.AkademiCreate, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    existing = db.query(models.Akademi).filter(models.Akademi.name == akademi.name.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu isimde bir akademi zaten mevcut!")
    yeni_ak = models.Akademi(name=akademi.name.strip())
    db.add(yeni_ak)
    db.commit()
    db.refresh(yeni_ak)
    return yeni_ak

@app.post("/akademiler/kurulum", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def kurulum_akademi(data: schemas.AkademiKurulumCreate, db: Session = Depends(get_db)):
    ak_name = data.akademi_adi.strip()
    k_name = data.kullanici_adi.strip()
    if not ak_name or not k_name or not data.sifre.strip():
        raise HTTPException(status_code=400, detail="Akademi adı, kullanıcı adı ve şifre zorunludur.")

    existing_ak = db.query(models.Akademi).filter(models.Akademi.name == ak_name).first()
    if existing_ak:
        raise HTTPException(status_code=400, detail=f"'{ak_name}' isimli akademi zaten veritabanında mevcut!")

    existing_user = db.query(models.Kullanici).filter(models.Kullanici.kullanici_adi == k_name).first()
    if existing_user:
        raise HTTPException(status_code=400, detail=f"'{k_name}' kullanıcı adı zaten kullanımda!")

    # 1. Yeni Akademi Oluştur
    yeni_ak = models.Akademi(name=ak_name)
    db.add(yeni_ak)
    db.commit()
    db.refresh(yeni_ak)

    # 2. Yeni İlk Yönetici Kullanıcısını Oluştur
    yeni_user = models.Kullanici(
        kullanici_adi=k_name,
        sifre=hash_password(data.sifre.strip()),
        rol="Yönetici",
        ad_soyad=data.ad_soyad.strip() if data.ad_soyad else f"{ak_name} Yöneticisi",
        akademi_adi=ak_name
    )
    db.add(yeni_user)
    db.commit()
    db.refresh(yeni_user)

    # 3. Otomatik JWT Access Token üret
    access_token = create_access_token(data={
        "sub": yeni_user.kullanici_adi, 
        "rol": yeni_user.rol,
        "akademi_adi": ak_name
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": yeni_user
    }


# ==================== KULLANICI & AUTH ENDPOINTLERİ ====================
@app.post("/kullanicilar/login", response_model=schemas.TokenResponse)
@limiter.limit("5/minute")
async def login_kullanici(request: Request, credentials: schemas.KullaniciLogin, db: Session = Depends(get_db)):
    kullanici = db.query(models.Kullanici).filter(
        models.Kullanici.kullanici_adi == credentials.kullanici_adi.strip()
    ).first()
    if not kullanici or not verify_password(credentials.sifre.strip(), kullanici.sifre):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Kullanıcı adı veya şifre hatalı!")
    
    # Oturum için aktif akademi belirlenir (seçilen akademi veya kullanıcının kayıtlı akademisi)
    selected_akademi = credentials.akademi_adi.strip() if credentials.akademi_adi else None
    session_akademi = selected_akademi or kullanici.akademi_adi or "Test1"

    access_token = create_access_token(data={
        "sub": kullanici.kullanici_adi, 
        "rol": kullanici.rol,
        "akademi_adi": session_akademi
    })

    # Yanıtta kullanıcının aktif oturum akademisini (session_akademi) dön
    user_res = schemas.KullaniciResponse.model_validate(kullanici)
    user_res.akademi_adi = session_akademi

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_res
    }

@app.get("/kullanicilar/", response_model=List[schemas.KullaniciResponse])
def get_kullanicilar(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Kullanici)
    if current_user.akademi_adi:
        query = query.filter(models.Kullanici.akademi_adi == current_user.akademi_adi)
    return query.all()

@app.post("/kullanicilar/", response_model=schemas.KullaniciResponse, status_code=status.HTTP_201_CREATED)
def create_kullanici(
    user_data: schemas.KullaniciCreate, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    k_adi = user_data.kullanici_adi.strip()
    existing = db.query(models.Kullanici).filter(models.Kullanici.kullanici_adi == k_adi).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bu kullanıcı adı zaten mevcut!")
    
    yeni_kullanici = models.Kullanici(
        kullanici_adi=k_adi,
        sifre=hash_password(user_data.sifre.strip()),
        rol=user_data.rol or "Personel",
        ad_soyad=user_data.ad_soyad.strip() if user_data.ad_soyad else None,
        akademi_adi=current_user.akademi_adi or "Test1"
    )
    db.add(yeni_kullanici)
    db.commit()
    db.refresh(yeni_kullanici)
    return yeni_kullanici

@app.delete("/kullanicilar/{user_id}", status_code=status.HTTP_200_OK)
def delete_kullanici(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    user = db.query(models.Kullanici).filter(models.Kullanici.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kullanıcı bulunamadı!")
    
    if user.kullanici_adi == "doruk":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ana yönetici hesabı (doruk) silinemez!")

    if current_user.akademi_adi and user.akademi_adi and user.akademi_adi != current_user.akademi_adi:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Başka bir akademiye ait kullanıcıyı silemezsiniz!")

    db.delete(user)
    db.commit()
    return {"mesaj": "Kullanıcı başarıyla silindi."}


# ==================== DERS PROGRAMI ENDPOINTLERİ ====================
@app.get("/ders-programi/", response_model=List[schemas.DersProgramiResponse])
def get_ders_programi(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.DersProgrami).join(models.DersProgrami.sinif)
    if current_user.akademi_adi:
        query = query.filter(models.Sinif.akademi_adi == current_user.akademi_adi)
    program = query.options(joinedload(models.DersProgrami.sinif)).all()
    res = []
    for item in program:
        sinif_adi = item.sinif.sinif_adi if item.sinif else None
        res.append(schemas.DersProgramiResponse(
            id=item.id,
            sinif_id=item.sinif_id,
            gun=item.gun,
            baslangic_saati=item.baslangic_saati,
            bitis_saati=item.bitis_saati,
            ders_adi=item.ders_adi,
            ogretmen_adi=item.ogretmen_adi,
            renk=item.renk or "indigo",
            sinif_adi=sinif_adi
        ))
    return res

@app.post("/ders-programi/", response_model=schemas.DersProgramiResponse, status_code=status.HTTP_201_CREATED)
def create_ders_programi(
    item: schemas.DersProgramiCreate, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    sinif_query = db.query(models.Sinif).filter(models.Sinif.id == item.sinif_id)
    if current_user.akademi_adi:
        sinif_query = sinif_query.filter(models.Sinif.akademi_adi == current_user.akademi_adi)
    sinif = sinif_query.first()
    if not sinif:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı.")

    yeni_ders = models.DersProgrami(
        sinif_id=item.sinif_id,
        gun=item.gun.strip(),
        baslangic_saati=item.baslangic_saati.strip(),
        bitis_saati=item.bitis_saati.strip(),
        ders_adi=item.ders_adi.strip() if item.ders_adi else sinif.sinif_adi,
        ogretmen_adi=item.ogretmen_adi.strip() if item.ogretmen_adi else None,
        renk=item.renk or "indigo"
    )
    db.add(yeni_ders)
    db.commit()
    db.refresh(yeni_ders)

    return schemas.DersProgramiResponse(
        id=yeni_ders.id,
        sinif_id=yeni_ders.sinif_id,
        gun=yeni_ders.gun,
        baslangic_saati=yeni_ders.baslangic_saati,
        bitis_saati=yeni_ders.bitis_saati,
        ders_adi=yeni_ders.ders_adi,
        ogretmen_adi=yeni_ders.ogretmen_adi,
        renk=yeni_ders.renk,
        sinif_adi=sinif.sinif_adi
    )

@app.delete("/ders-programi/{ders_id}", status_code=status.HTTP_200_OK)
def delete_ders_programi(
    ders_id: int, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    ders = db.query(models.DersProgrami).filter(models.DersProgrami.id == ders_id).first()
    if not ders:
        raise HTTPException(status_code=404, detail="Ders bulunamadı.")
    db.delete(ders)
    db.commit()
    return {"mesaj": "Ders programı kaydı silindi."}


# ==================== YOKLAMA ENDPOINTLERİ ====================
@app.get("/yoklama/", response_model=List[schemas.YoklamaResponse])
def get_yoklama(
    sinif_id: Optional[int] = Query(None),
    tarih: Optional[str] = Query(None), # YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    query = db.query(models.Yoklama).options(
        joinedload(models.Yoklama.ogrenci),
        joinedload(models.Yoklama.sinif)
    )

    if current_user.akademi_adi:
        query = query.filter(models.Yoklama.akademi_adi == current_user.akademi_adi)

    if sinif_id is not None:
        query = query.filter(models.Yoklama.sinif_id == sinif_id)

    if tarih:
        try:
            start_date = datetime.strptime(tarih, "%Y-%m-%d")
            end_date = start_date + timedelta(days=1)
            query = query.filter(
                models.Yoklama.tarih >= start_date,
                models.Yoklama.tarih < end_date
            )
        except Exception:
            raise HTTPException(status_code=400, detail="Geçersiz tarih formatı (YYYY-MM-DD olmalı).")

    yoklamalar = query.order_by(models.Yoklama.tarih.desc()).all()

    res = []
    for y in yoklamalar:
        o_name = f"{y.ogrenci.isim} {y.ogrenci.soyisim}" if y.ogrenci else None
        s_name = y.sinif.sinif_adi if y.sinif else None
        res.append(schemas.YoklamaResponse(
            id=y.id,
            ogrenci_id=y.ogrenci_id,
            sinif_id=y.sinif_id,
            tarih=y.tarih,
            durum=y.durum,
            aciklama=y.aciklama,
            ogrenci_adi=o_name,
            sinif_adi=s_name
        ))
    return res

@app.post("/yoklama/toplu", status_code=status.HTTP_200_OK)
def save_yoklama_toplu(
    req: schemas.YoklamaSaveRequest, 
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    try:
        target_date = datetime.strptime(req.tarih, "%Y-%m-%d")
    except Exception:
        target_date = datetime.utcnow()

    start_date = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0)
    end_date = start_date + timedelta(days=1)

    # Mevcut yoklamaları getir
    existing_query = db.query(models.Yoklama).filter(
        models.Yoklama.sinif_id == req.sinif_id,
        models.Yoklama.tarih >= start_date,
        models.Yoklama.tarih < end_date
    )
    if current_user.akademi_adi:
        existing_query = existing_query.filter(models.Yoklama.akademi_adi == current_user.akademi_adi)
    existing = existing_query.all()

    existing_map = {y.ogrenci_id: y for y in existing}

    for item in req.yoklamalar:
        aciklama_val = item.aciklama.strip() if item.aciklama and item.aciklama.strip() else None
        if item.ogrenci_id in existing_map:
            # Güncelle
            rec = existing_map[item.ogrenci_id]
            rec.durum = item.durum
            rec.aciklama = aciklama_val
        else:
            # Yeni Ekle: Sınıfın dersi yapıldığında öğrencilerin durumundan (geldi/gelmedi/mazeret) bağımsız olarak ders hakkı eksilir
            new_rec = models.Yoklama(
                ogrenci_id=item.ogrenci_id,
                sinif_id=req.sinif_id,
                tarih=start_date,
                durum=item.durum,
                aciklama=aciklama_val,
                akademi_adi=current_user.akademi_adi or "Test1"
            )
            db.add(new_rec)

            ogrenci_sinif = db.query(models.OgrenciSinif).filter(
                models.OgrenciSinif.ogrenci_id == item.ogrenci_id,
                models.OgrenciSinif.sinif_id == req.sinif_id
            ).first()

            if ogrenci_sinif:
                ogrenci_sinif.kalan_ders_hakki -= 1

    db.commit()
    return {"mesaj": "Yoklama başarıyla kaydedildi.", "kayit_sayisi": len(req.yoklamalar)}

@app.delete("/yoklama/oturum", status_code=status.HTTP_200_OK)
def delete_yoklama_oturum(
    sinif_id: int = Query(...),
    tarih: str = Query(...), # YYYY-MM-DD
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    try:
        start_date = datetime.strptime(tarih, "%Y-%m-%d")
        end_date = start_date + timedelta(days=1)
    except Exception:
        raise HTTPException(status_code=400, detail="Geçersiz tarih formatı (YYYY-MM-DD olmalı).")

    existing_query = db.query(models.Yoklama).filter(
        models.Yoklama.sinif_id == sinif_id,
        models.Yoklama.tarih >= start_date,
        models.Yoklama.tarih < end_date
    )
    if current_user.akademi_adi:
        existing_query = existing_query.filter(models.Yoklama.akademi_adi == current_user.akademi_adi)
    existing = existing_query.all()

    for y in existing:
        ogrenci_sinif = db.query(models.OgrenciSinif).filter(
            models.OgrenciSinif.ogrenci_id == y.ogrenci_id,
            models.OgrenciSinif.sinif_id == sinif_id
        ).first()

        if ogrenci_sinif:
            ogrenci_sinif.kalan_ders_hakki += 1

        db.delete(y)

    db.commit()
    return {"mesaj": "Yoklama oturumu silindi.", "silinen_sayi": len(existing)}


