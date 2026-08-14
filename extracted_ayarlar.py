@app.get("/akademiler/ayarlar", response_model=schemas.AkademiResponse)
def get_akademi_ayarlar(
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    if not current_user.akademi_adi:
        raise HTTPException(status_code=400, detail="Kullan─▒c─▒ bir akademiye ba─şl─▒ de─şil.")
    
    akademi = db.query(models.Akademi).filter(models.Akademi.name == current_user.akademi_adi).first()
    if not akademi:
        raise HTTPException(status_code=404, detail="Akademi bulunamad─▒.")
        
    return akademi


@app.put("/akademiler/ayarlar", response_model=schemas.AkademiResponse)
def update_akademi_ayarlar(
    ayarlar: schemas.AkademiUpdate,
    db: Session = Depends(get_db),
    current_user: models.Kullanici = Depends(get_current_user)
):
    if current_user.rol != "Y├Ânetici":
        raise HTTPException(status_code=403, detail="Bu i┼şlem i├ğin y├Ânetici yetkisi gerekiyor.")
        
    if not current_user.akademi_adi:
        raise HTTPException(status_code=400, detail="Kullan─▒c─▒ bir akademiye ba─şl─▒ de─şil.")
        
    akademi = db.query(models.Akademi).filter(models.Akademi.name == current_user.akademi_adi).first()
    if not akademi:
        raise HTTPException(status_code=404, detail="Akademi bulunamad─▒.")
        
    if ayarlar.whatsapp_provider is not None:
        akademi.whatsapp_provider = ayarlar.whatsapp_provider
    if ayarlar.whatsapp_api_key is not None:
        akademi.whatsapp_api_key = ayarlar.whatsapp_api_key
    if ayarlar.whatsapp_phone_number is not None:
        akademi.whatsapp_phone_number = ayarlar.whatsapp_phone_number
    if ayarlar.msg_kayit is not None:
        akademi.msg_kayit = ayarlar.msg_kayit
    if ayarlar.msg_ders_hatirlatma is not None:
        akademi.msg_ders_hatirlatma = ayarlar.msg_ders_hatirlatma
    if ayarlar.msg_odeme_hatirlatma is not None:
        akademi.msg_odeme_hatirlatma = ayarlar.msg_odeme_hatirlatma
    if ayarlar.msg_devamsizlik is not None:
        akademi.msg_devamsizlik = ayarlar.msg_devamsizlik
    if ayarlar.msg_dogum_gunu is not None:
        akademi.msg_dogum_gunu = ayarlar.msg_dogum_gunu
    if ayarlar.msg_ozel_gun is not None:
        akademi.msg_ozel_gun = ayarlar.msg_ozel_gun
        
    if ayarlar.is_msg_kayit_active is not None:
        akademi.is_msg_kayit_active = ayarlar.is_msg_kayit_active
    if ayarlar.is_msg_ders_hatirlatma_active is not None:
        akademi.is_msg_ders_hatirlatma_active = ayarlar.is_msg_ders_hatirlatma_active
    if ayarlar.is_msg_odeme_hatirlatma_active is not None:
        akademi.is_msg_odeme_hatirlatma_active = ayarlar.is_msg_odeme_hatirlatma_active
    if ayarlar.is_msg_devamsizlik_active is not None:
        akademi.is_msg_devamsizlik_active = ayarlar.is_msg_devamsizlik_active
    if ayarlar.is_msg_dogum_gunu_active is not None:
        akademi.is_msg_dogum_gunu_active = ayarlar.is_msg_dogum_gunu_active
    if ayarlar.is_msg_ozel_gun_active is not None:
        akademi.is_msg_ozel_gun_active = ayarlar.is_msg_ozel_gun_active
        
    db.commit()
    db.refresh(akademi)
    return akademi
