import os

NEW_ROUTES = """
# ==================== SENE SONU ARŞİVİ ====================
import json
from fastapi.encoders import jsonable_encoder

@app.post("/api/arsiv/sezon-sonu")
def sezon_sonu_devri(
    arsiv_req: schemas.SezonArsiviCreate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    if current_user.rol != "Yönetici":
        raise HTTPException(status_code=403, detail="Bu işlem için Yönetici yetkisi gereklidir.")
    
    akademi_adi = current_user.akademi_adi
    if not akademi_adi:
        raise HTTPException(status_code=400, detail="Akademi bulunamadı.")
        
    # 1. Mevcut verileri topla
    ogrenciler = db.query(models.Ogrenci).filter(models.Ogrenci.akademi_adi == akademi_adi).all()
    siniflar = db.query(models.Sinif).filter(models.Sinif.akademi_adi == akademi_adi).all()
    odemeler = db.query(models.Odeme).filter(models.Odeme.akademi_adi == akademi_adi).all()
    yoklamalar = db.query(models.Yoklama).filter(models.Yoklama.akademi_adi == akademi_adi).all()
    ders_programlari = db.query(models.DersProgrami).join(models.Sinif).filter(models.Sinif.akademi_adi == akademi_adi).all()
    ogrenci_siniflar = db.query(models.OgrenciSinif).join(models.Sinif).filter(models.Sinif.akademi_adi == akademi_adi).all()
    
    # Hepsini tek bir dict içine koyalım
    dump_data = {
        "ogrenciler": [
            {
                "id": o.id, "isim": o.isim, "soyisim": o.soyisim, "tc": o.tc,
                "telefon": o.telefon, "bakiye": o.bakiye, "kayit_tarihi": str(o.kayit_tarihi)
            } for o in ogrenciler
        ],
        "siniflar": [
            {"id": s.id, "sinif_adi": s.sinif_adi} for s in siniflar
        ],
        "ogrenci_siniflar": [
            {"ogrenci_id": osin.ogrenci_id, "sinif_id": osin.sinif_id} for osin in ogrenci_siniflar
        ],
        "odemeler": [
            {
                "id": od.id, "ogrenci_id": od.ogrenci_id, "tutar": od.tutar,
                "tarih": str(od.tarih), "durum": od.durum, "odeme_yontemi": od.odeme_yontemi,
                "aciklama": od.aciklama
            } for od in odemeler
        ],
        "yoklamalar": [
            {
                "id": y.id, "ogrenci_id": y.ogrenci_id, "sinif_id": y.sinif_id,
                "tarih": str(y.tarih), "durum": y.durum
            } for y in yoklamalar
        ]
    }
    
    veri_dump_str = json.dumps(dump_data, ensure_ascii=False)
    
    # 2. Arşive kaydet
    yeni_arsiv = models.SezonArsivi(
        akademi_adi=akademi_adi,
        sezon_adi=arsiv_req.sezon_adi,
        veri_dump=veri_dump_str
    )
    db.add(yeni_arsiv)
    
    # 3. Mevcut verileri sil / sıfırla
    # Ders programlarını sil
    for dp in ders_programlari:
        db.delete(dp)
    # Yoklamaları sil
    for y in yoklamalar:
        db.delete(y)
    # Ödemeleri sil
    for od in odemeler:
        db.delete(od)
    # Öğrenci sınıflarını sil
    for osin in ogrenci_siniflar:
        db.delete(osin)
    # Sınıfları sil
    for s in siniflar:
        db.delete(s)
        
    # Öğrenci bakiyelerini sıfırla
    for o in ogrenciler:
        o.bakiye = 0.0
        
    db.commit()
    
    return {"message": f"{arsiv_req.sezon_adi} sezonu başarıyla arşivlendi ve sistem yeni sezona hazırlandı."}

@app.get("/api/arsiv/sezonlar", response_model=List[schemas.SezonArsiviResponse])
def get_sezonlar(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    return db.query(models.SezonArsivi).filter(models.SezonArsivi.akademi_adi == current_user.akademi_adi).order_by(models.SezonArsivi.olusturulma_tarihi.desc()).all()

@app.get("/api/arsiv/sezonlar/{arsiv_id}", response_model=schemas.SezonArsiviDetailResponse)
def get_sezon_detay(
    arsiv_id: int,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    arsiv = db.query(models.SezonArsivi).filter(
        models.SezonArsivi.id == arsiv_id,
        models.SezonArsivi.akademi_adi == current_user.akademi_adi
    ).first()
    if not arsiv:
        raise HTTPException(status_code=404, detail="Arşiv bulunamadı.")
    return arsiv

"""

def main():
    file_path = "main.py"
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    target = "# --- GOOGLE SHEETS BACKUP SCHEDULER ---"
    if target in content and "/api/arsiv/sezon-sonu" not in content:
        content = content.replace(target, NEW_ROUTES + "\n\n" + target)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Routes injected successfully.")
    else:
        print("Target not found or routes already exist.")

if __name__ == "__main__":
    main()
