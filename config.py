import os
from dotenv import load_dotenv

# .env dosyasını yükle
load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./akademi.db"  # Fallback to local SQLite if .env is missing
    )
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", 
        "your-super-secret-key-change-it-in-production"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    _raw_origins = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    )
    ALLOWED_ORIGINS: list = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

settings = Settings()
