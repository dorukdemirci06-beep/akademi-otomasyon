from database import engine
from sqlalchemy import text

def add_columns():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE akademiler ADD COLUMN msg_ogretmen_hatirlatma VARCHAR;"))
            print("Added msg_ogretmen_hatirlatma")
        except Exception as e:
            print("Could not add msg_ogretmen_hatirlatma:", e)
            
        try:
            conn.execute(text("ALTER TABLE akademiler ADD COLUMN is_msg_ogretmen_hatirlatma_active BOOLEAN DEFAULT FALSE;"))
            print("Added is_msg_ogretmen_hatirlatma_active")
        except Exception as e:
            print("Could not add is_msg_ogretmen_hatirlatma_active:", e)
            
        conn.commit()

if __name__ == "__main__":
    add_columns()
