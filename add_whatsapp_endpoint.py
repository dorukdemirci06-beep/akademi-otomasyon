import os

code_to_add = """

# --- WHATSAPP BULK SEND ENDPOINT ---
def background_send_whatsapp_messages(akademi_adi: str, request: schemas.WhatsAppBulkRequest):
    db = SessionLocal()
    try:
        akademi = db.query(models.Akademi).filter(models.Akademi.name == akademi_adi).first()
        if not akademi:
            return

        query = db.query(models.Ogrenci).filter(
            models.Ogrenci.akademi_adi == akademi_adi,
            models.Ogrenci.durum == 'Aktif'
        )

        if request.target_type == 'sinif' and request.target_ids:
            query = query.join(models.OgrenciSinif).join(models.Sinif).filter(
                models.Sinif.sinif_adi.in_(request.target_ids)
            )
        elif request.target_type == 'kisi' and request.target_ids:
            query = query.filter(models.Ogrenci.id.in_([int(i) for i in request.target_ids]))

        ogrenciler = query.all()
        
        for ogrenci in ogrenciler:
            phone = ogrenci.telefon
            if ogrenci.birincil_veli == "Anne" and ogrenci.anne_telefon:
                phone = ogrenci.anne_telefon
            elif ogrenci.birincil_veli == "Baba" and ogrenci.baba_telefon:
                phone = ogrenci.baba_telefon
            
            if phone:
                try:
                    send_whatsapp_message(
                        phone_number=phone,
                        message=request.message,
                        provider=akademi.whatsapp_provider,
                        api_key=akademi.whatsapp_api_key,
                        phone_id=akademi.whatsapp_phone_number
                    )
                except Exception as e:
                    print(f"Error sending message to {phone}: {e}")
    finally:
        db.close()

@app.post("/whatsapp/toplu-gonder")
def bulk_send_whatsapp(
    request: schemas.WhatsAppBulkRequest,
    background_tasks: BackgroundTasks,
    current_user: models.Kullanici = Depends(get_current_user)
):
    if not current_user.akademi_adi:
        raise HTTPException(status_code=400, detail="Akademi bulunamadı.")
    
    background_tasks.add_task(background_send_whatsapp_messages, current_user.akademi_adi, request)
    return {"message": "Toplu mesajlar sıraya eklendi."}
"""

with open("main.py", "a", encoding="utf-8") as f:
    f.write(code_to_add)

print("Endpoint added to main.py")
