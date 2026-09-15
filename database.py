from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import settings

SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

from sqlalchemy.pool import NullPool

# Veritabanı Motoru
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        poolclass=NullPool
    )

# Veritabanı Oturumu (Session)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)