import sys
sys.path.append('.')
from database import SessionLocal
from sqlalchemy import text

def migrate():
    db = SessionLocal()
    try:
        db.execute(text('ALTER TABLE akademiler ADD COLUMN is_maintenance_mode BOOLEAN DEFAULT FALSE'))
        db.execute(text('ALTER TABLE akademiler ADD COLUMN maintenance_message VARCHAR'))
        db.execute(text('ALTER TABLE akademiler ADD COLUMN maintenance_end_time VARCHAR'))
        db.commit()
        print('Production database migrated successfully: Added maintenance mode columns.')
    except Exception as e:
        print('Migration error (columns might already exist):', e)
        db.rollback()

if __name__ == '__main__':
    migrate()
