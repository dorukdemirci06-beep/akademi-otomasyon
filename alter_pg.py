from sqlalchemy import text
from database import engine

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE ogrenciler ADD COLUMN birincil_veli VARCHAR DEFAULT 'Kendisi';"))
        conn.commit()
        print("Column birincil_veli added successfully to PostgreSQL database!")
except Exception as e:
    print(f"Error: {e}")
