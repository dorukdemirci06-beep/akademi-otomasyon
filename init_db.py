import bcrypt
from sqlalchemy import text
from database import engine, SessionLocal
import models
from logger import get_logger

logger = get_logger("init_db")

def hash_password(password: str) -> str:
    if not password:
        password = ""
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

def init_db():
    logger.info("Veritabani tablolari olusturuluyor...")
    models.Base.metadata.create_all(bind=engine)

def auto_migrate():
    logger.info("Otomatik migrasyon baslatiliyor...")
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
            conn.execute(text("ALTER TABLE on_kayitlar ADD COLUMN IF NOT EXISTS notlar VARCHAR;"))
            
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
        logger.info("Otomatik migrasyon tamamlandi.")
    except Exception as e:
        logger.error(f"Otomatik migrasyon uyarisi: {e}")

def seed_initial_user():
    logger.info("Baslangic verileri kontrol ediliyor...")
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
                sifre=hash_password("Dd150106!"),
                rol="Yönetici",
                ad_soyad="Doruk (Yönetici)",
                akademi_adi="Test1"
            )
            db.add(admin_user)
            db.commit()
            logger.info("Ilk yonetici kullanicisi (doruk / Dd150106! - Test1) olusturuldu.")
        else:
            if not admin_user.akademi_adi:
                admin_user.akademi_adi = "Test1"
            if not (admin_user.sifre.startswith("$2b$") or admin_user.sifre.startswith("$2a$")):
                admin_user.sifre = hash_password("Dd150106!")
            db.commit()
        db.close()
        logger.info("Baslangic verileri basariyla yuklendi.")
    except Exception as e:
        logger.error(f"Kullanici seed uyarisi: {e}")

if __name__ == "__main__":
    init_db()
    auto_migrate()
    seed_initial_user()
    logger.info("Tum veritabani kurulum islemleri tamamlandi!")
