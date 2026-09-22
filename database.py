from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

from sqlalchemy.pool import QueuePool

# Veritabanı Motoru
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL (Neon vb.) için bağlantı havuzu (Connection Pooling) ayarları
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=QueuePool,
        pool_size=10,          # Havuzda her zaman hazır bekleyecek bağlantı sayısı
        max_overflow=20,       # Havuz dolduğunda açılabilecek ekstra maksimum bağlantı sayısı
        pool_timeout=30,       # Havuzdan bağlantı almak için beklenecek maksimum süre (saniye)
        pool_pre_ping=True,    # Kopmuş bağlantıları önceden tespit edip yeniden bağlanır (Pessimistic disconnect)
        pool_recycle=1800      # 30 dakikadan eski bağlantıları yeniler
    )

# Veritabanı Oturumu (Session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)