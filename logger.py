import logging
import sys
import os
from logging.handlers import RotatingFileHandler

# Log dosyalarının tutulacağı klasör
LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

# Temel logger oluştur
logger = logging.getLogger("akademi")
logger.setLevel(logging.INFO)

# Eğer daha önceden handler eklenmişse (çift loglamayı önlemek için) temizle
if logger.hasHandlers():
    logger.handlers.clear()

# Log formatı: "Tarih - ModülAdı - Seviye - Mesaj"
formatter = logging.Formatter(
    fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# 1. Konsol Çıktısı (Ekrana yazdırmak için)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 2. Dosya Çıktısı (Hataları dosyaya kaydetmek için, max 5MB, son 5 dosya saklanır)
file_handler = RotatingFileHandler(
    os.path.join(LOG_DIR, "app.log"), maxBytes=5 * 1024 * 1024, backupCount=5, encoding="utf-8"
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

def get_logger(module_name: str):
    """Her dosya için özel isimlendirilmiş bir alt logger döndürür."""
    return logger.getChild(module_name)
