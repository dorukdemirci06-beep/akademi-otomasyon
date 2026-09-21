import os
from sqlalchemy import create_engine, text
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from config import settings

# Mevcut düz metin (plain text) TC verilerini şifrelemek (Fernet) için Migration Script'i
# Bu scripti yalnızca BİR KERE çalıştırın.

def migrate_to_encrypted():
    engine = create_engine(settings.DATABASE_URL)
    fernet = Fernet(settings.ENCRYPTION_KEY.encode())

    with engine.connect() as conn:
        # Tüm öğrencileri ham SQL ile çekiyoruz (ORM kullanmıyoruz ki otomatik çözmeye çalışmasın)
        result = conn.execute(text("SELECT id, tc, anne_tc, baba_tc FROM ogrenciler")).fetchall()
        
        updated_count = 0
        for row in result:
            id_val = row[0]
            tc_val = row[1]
            anne_tc_val = row[2]
            baba_tc_val = row[3]
            
            updates = {}
            
            # Eğer değer varsa ve şifreli değilse (Fernet şifreleri "gAAAAAB" ile başlar)
            if tc_val and not tc_val.startswith('gAAAAAB'):
                updates['tc'] = fernet.encrypt(tc_val.encode('utf-8')).decode('utf-8')
                
            if anne_tc_val and not anne_tc_val.startswith('gAAAAAB'):
                updates['anne_tc'] = fernet.encrypt(anne_tc_val.encode('utf-8')).decode('utf-8')
                
            if baba_tc_val and not baba_tc_val.startswith('gAAAAAB'):
                updates['baba_tc'] = fernet.encrypt(baba_tc_val.encode('utf-8')).decode('utf-8')
                
            if updates:
                set_clauses = ", ".join([f"{k} = :{k}" for k in updates.keys()])
                sql = f"UPDATE ogrenciler SET {set_clauses} WHERE id = :id"
                updates['id'] = id_val
                
                conn.execute(text(sql), updates)
                updated_count += 1
                
        conn.commit()
        print(f"✅ {updated_count} adet öğrencinin TC bilgileri başarıyla şifrelendi!")

if __name__ == "__main__":
    migrate_to_encrypted()
