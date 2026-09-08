import os

file_path = "main.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update dump logic
dump_old = """        "yoklamalar": [
            {
                "id": y.id, "ogrenci_id": y.ogrenci_id, "sinif_id": y.sinif_id,
                "tarih": str(y.tarih), "durum": y.durum
            } for y in yoklamalar
        ]"""
dump_new = """        "yoklamalar": [
            {
                "id": y.id, "ogrenci_id": y.ogrenci_id, "sinif_id": y.sinif_id,
                "tarih": str(y.tarih), "durum": y.durum
            } for y in yoklamalar
        ],
        "ders_programlari": [
            {
                "id": dp.id, "sinif_id": dp.sinif_id, "gun": dp.gun,
                "baslangic_saati": str(dp.baslangic_saati), "bitis_saati": str(dp.bitis_saati),
                "ders_adi": dp.ders_adi
            } for dp in ders_programlari
        ]"""
content = content.replace(dump_old, dump_new)

# 2. Append Restore API
restore_api = """
from datetime import datetime

def safe_parse_date(date_str):
    if not date_str or str(date_str) == "None":
        return None
    try:
        # e.g. "2024-03-24"
        return datetime.strptime(str(date_str).split(" ")[0], "%Y-%m-%d").date()
    except Exception:
        return None

def safe_parse_time(time_str):
    if not time_str or str(time_str) == "None":
        return None
    try:
        # e.g. "12:30:00" or "12:30"
        time_part = str(time_str).split(" ")[0]
        if len(time_part.split(":")) == 2:
            time_part += ":00"
        return datetime.strptime(time_part, "%H:%M:%S").time()
    except Exception:
        return None

@app.post("/api/arsiv/geri-al/{arsiv_id}")
def sezon_geri_al(
    arsiv_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    if current_user.rol != "Yönetici":
        raise HTTPException(status_code=403, detail="Bu işlem için Yönetici yetkisi gereklidir.")
    
    akademi_adi = current_user.akademi_adi
    if not akademi_adi:
        raise HTTPException(status_code=400, detail="Akademi bulunamadı.")
        
    arsiv = db.query(models.SezonArsivi).filter(
        models.SezonArsivi.id == arsiv_id, 
        models.SezonArsivi.akademi_adi == akademi_adi
    ).first()
    
    if not arsiv:
        raise HTTPException(status_code=404, detail="Arşiv bulunamadı.")
        
    try:
        dump_data = json.loads(arsiv.veri_dump)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Arşiv verisi okunamadı.")
        
    # 1. Mevcut verileri sil (temizle)
    db.query(models.DersProgrami).filter(models.DersProgrami.sinif_id.in_(
        db.query(models.Sinif.id).filter(models.Sinif.akademi_adi == akademi_adi)
    )).delete(synchronize_session=False)
    
    db.query(models.Yoklama).filter(models.Yoklama.akademi_adi == akademi_adi).delete(synchronize_session=False)
    db.query(models.Odeme).filter(models.Odeme.akademi_adi == akademi_adi).delete(synchronize_session=False)
    db.query(models.OgrenciSinif).filter(models.OgrenciSinif.sinif_id.in_(
        db.query(models.Sinif.id).filter(models.Sinif.akademi_adi == akademi_adi)
    )).delete(synchronize_session=False)
    db.query(models.Sinif).filter(models.Sinif.akademi_adi == akademi_adi).delete(synchronize_session=False)
    
    # 2. Öğrenci bakiyelerini yükle
    ogrenci_bakiye_map = {o["id"]: o["bakiye"] for o in dump_data.get("ogrenciler", [])}
    mevcut_ogrenciler = db.query(models.Ogrenci).filter(models.Ogrenci.akademi_adi == akademi_adi).all()
    for mo in mevcut_ogrenciler:
        if mo.id in ogrenci_bakiye_map:
            mo.bakiye = ogrenci_bakiye_map[mo.id]
            
    # 3. Sınıfları oluştur ve ID mapping yap
    sinif_id_map = {} # old_id -> new_id
    for s_data in dump_data.get("siniflar", []):
        yeni_sinif = models.Sinif(
            akademi_adi=akademi_adi,
            sinif_adi=s_data["sinif_adi"]
        )
        db.add(yeni_sinif)
        db.flush() # ID'yi alabilmek için
        sinif_id_map[s_data["id"]] = yeni_sinif.id
        
    # 4. Öğrenci-Sınıf bağlarını yükle
    for os_data in dump_data.get("ogrenci_siniflar", []):
        if os_data["sinif_id"] in sinif_id_map:
            yeni_os = models.OgrenciSinif(
                ogrenci_id=os_data["ogrenci_id"],
                sinif_id=sinif_id_map[os_data["sinif_id"]]
            )
            db.add(yeni_os)
            
    # 5. Ödemeleri yükle
    for od_data in dump_data.get("odemeler", []):
        yeni_od = models.Odeme(
            akademi_adi=akademi_adi,
            ogrenci_id=od_data["ogrenci_id"],
            tutar=od_data["tutar"],
            tarih=safe_parse_date(od_data.get("tarih")),
            durum=od_data["durum"],
            odeme_yontemi=od_data.get("odeme_yontemi"),
            aciklama=od_data.get("aciklama")
        )
        db.add(yeni_od)
        
    # 6. Yoklamaları yükle
    for y_data in dump_data.get("yoklamalar", []):
        if y_data["sinif_id"] in sinif_id_map:
            yeni_y = models.Yoklama(
                akademi_adi=akademi_adi,
                ogrenci_id=y_data["ogrenci_id"],
                sinif_id=sinif_id_map[y_data["sinif_id"]],
                tarih=safe_parse_date(y_data.get("tarih")),
                durum=y_data["durum"]
            )
            db.add(yeni_y)
            
    # 7. Ders programlarını yükle
    for dp_data in dump_data.get("ders_programlari", []):
        if dp_data["sinif_id"] in sinif_id_map:
            yeni_dp = models.DersProgrami(
                sinif_id=sinif_id_map[dp_data["sinif_id"]],
                gun=dp_data.get("gun", ""),
                baslangic_saati=safe_parse_time(dp_data.get("baslangic_saati")),
                bitis_saati=safe_parse_time(dp_data.get("bitis_saati")),
                ders_adi=dp_data.get("ders_adi", "")
            )
            db.add(yeni_dp)
            
    # 8. Arşivi sil
    db.delete(arsiv)
    db.commit()
    
    return {"message": "Arşiv başarıyla geri yüklendi. Sistem arşivdeki haline döndü."}

"""

if "def sezon_geri_al(" not in content:
    content = content + "\n" + restore_api

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Backend archive logic updated.")
