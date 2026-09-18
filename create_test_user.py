import os
from sqlalchemy import create_engine, text
import bcrypt
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv('DATABASE_URL').replace('postgresql://', 'postgresql+psycopg2://')
engine = create_engine(db_url)
pwd = bcrypt.hashpw('password123'.encode(), bcrypt.gensalt()).decode()

with engine.connect() as conn:
    conn.execute(text(f"INSERT INTO kullanicilar (kullanici_adi, sifre, rol, ad_soyad, akademi_adi) VALUES ('testhacker', '{pwd}', 'Personel', 'Hacker', 'TestAkademi100')"))
    conn.commit()

print('Created testhacker')
