from sqlalchemy import text
from database import engine

try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE ders_programi ADD COLUMN derslik_id INTEGER REFERENCES derslikler(id);"))
        conn.commit()
        print("Column derslik_id added successfully to PostgreSQL database!")
except Exception as e:
    print(f"Error: {e}")
