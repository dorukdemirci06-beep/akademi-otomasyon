import sys
import random
from database import SessionLocal
from models import DersProgrami

colors = ["red", "emerald", "amber", "sky", "rose", "teal", "fuchsia", "lime"]

db = SessionLocal()
try:
    dersler = db.query(DersProgrami).all()
    for i, ders in enumerate(dersler):
        ders.renk = colors[i % len(colors)]
        print(f"Updated {ders.ders_adi} to {ders.renk}")
    db.commit()
    print("All classes updated with random colors!")
except Exception as e:
    print("Error:", e)
finally:
    db.close()
