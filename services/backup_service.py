import os
import gspread
from google.oauth2.service_account import Credentials
from sqlalchemy.orm import Session
from datetime import datetime
from database import SessionLocal
import models
from config import settings
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

def get_or_create_worksheet(sheet, title):
    try:
        return sheet.worksheet(title)
    except gspread.exceptions.WorksheetNotFound:
        return sheet.add_worksheet(title=title, rows="1000", cols="20")

def backup_all_to_sheets():
    print(f"[{datetime.now()}] Google Sheets Merkezi Yedekleme İşlemi Başladı...")
    
    sheet_id = os.getenv("GOOGLE_SHEET_ID")
    cred_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials.json")
    
    if not sheet_id:
        print("GOOGLE_SHEET_ID bulunamadı, yedekleme atlanıyor.")
        return
        
    if not os.path.exists(cred_file):
        print("credentials.json bulunamadı, yedekleme atlanıyor.")
        return

    try:
        credentials = Credentials.from_service_account_file(cred_file, scopes=SCOPES)
        client = gspread.authorize(credentials)
        sheet = client.open_by_key(sheet_id)
        
        db = SessionLocal()
        try:
            akademiler = db.query(models.Akademi).order_by(models.Akademi.name).all()
            
            def append_academy_data(data, akademi_name, headers, items, row_mapper):
                if not items:
                    return
                # Spacer
                if len(data) > 0:
                    data.append([""] * len(headers))
                # Academy Header
                data.append([f"--- {akademi_name.upper()} AKADEMİSİ ---"] + [""] * (len(headers) - 1))
                # Table Headers
                data.append(headers)
                # Data Rows
                for item in items:
                    data.append(row_mapper(item))

            # 1. ÖĞRENCİLER
            ws = get_or_create_worksheet(sheet, "Öğrenciler")
            data = []
            headers = ["Akademi Adı", "Öğrenci ID", "İsim", "Soyisim", "TC", "Telefon", "E-posta", "Kayıt Tarihi", "Durum", "Bakiye", "Anne İsim", "Anne Telefon", "Baba İsim", "Baba Telefon"]
            for akademi in akademiler:
                items = db.query(models.Ogrenci).filter(models.Ogrenci.akademi_adi == akademi.name).all()
                append_academy_data(data, akademi.name, headers, items, lambda o: [
                    o.akademi_adi or "", str(o.id), o.isim or "", o.soyisim or "", o.tc or "", o.telefon or "", o.eposta or "", 
                    o.kayit_tarihi.strftime("%Y-%m-%d %H:%M") if o.kayit_tarihi else "", o.durum or "", str(o.bakiye or 0.0), 
                    o.anne_isim or "", o.anne_telefon or "", o.baba_isim or "", o.baba_telefon or ""
                ])
            ws.clear()
            if data:
                ws.update(values=data, range_name=f"A1:N{len(data)}")

            # 2. SINIFLAR
            ws = get_or_create_worksheet(sheet, "Sınıflar")
            data = []
            headers = ["Akademi Adı", "Sınıf ID", "Sınıf Adı", "Derslik Bilgisi"]
            
            def get_sinif_derslikler(s):
                programlar = db.query(models.DersProgrami).filter(models.DersProgrami.sinif_id == s.id).all()
                derslikler = []
                for p in programlar:
                    if p.derslik and p.derslik.ad:
                        if p.derslik.ad not in derslikler:
                            derslikler.append(p.derslik.ad)
                return ", ".join(derslikler) if derslikler else "Belirtilmedi"
                
            for akademi in akademiler:
                items = db.query(models.Sinif).filter(models.Sinif.akademi_adi == akademi.name).all()
                append_academy_data(data, akademi.name, headers, items, lambda s: [
                    s.akademi_adi or "", str(s.id), s.sinif_adi or "", get_sinif_derslikler(s)
                ])
            ws.clear()
            if data:
                ws.update(values=data, range_name=f"A1:D{len(data)}")

            # 3. ÖDEMELER
            ws = get_or_create_worksheet(sheet, "Ödemeler")
            data = []
            headers = ["Akademi Adı", "Ödeme ID", "Öğrenci ID", "Öğrenci Adı Soyadı", "Tutar", "Tarih", "Yöntem", "Durum", "Tür", "Açıklama"]
            for akademi in akademiler:
                items = db.query(models.Odeme).filter(models.Odeme.akademi_adi == akademi.name).all()
                append_academy_data(data, akademi.name, headers, items, lambda o: [
                    o.akademi_adi or "", str(o.id), str(o.ogrenci_id or ""), 
                    f"{o.ogrenci.isim} {o.ogrenci.soyisim}" if o.ogrenci else "Bilinmiyor",
                    str(o.tutar or 0.0), 
                    o.tarih.strftime("%Y-%m-%d %H:%M") if o.tarih else "", o.odeme_yontemi or "", o.durum or "", o.odeme_turu or "", o.aciklama or ""
                ])
            ws.clear()
            if data:
                ws.update(values=data, range_name=f"A1:J{len(data)}")

            # 4. YOKLAMALAR
            ws = get_or_create_worksheet(sheet, "Yoklamalar")
            data = []
            headers = ["Akademi Adı", "Yoklama ID", "Öğrenci ID", "Öğrenci Adı Soyadı", "Sınıf ID", "Sınıf Adı", "Tarih", "Durum", "Açıklama"]
            for akademi in akademiler:
                items = db.query(models.Yoklama).filter(models.Yoklama.akademi_adi == akademi.name).all()
                append_academy_data(data, akademi.name, headers, items, lambda y: [
                    y.akademi_adi or "", str(y.id), str(y.ogrenci_id or ""), 
                    f"{y.ogrenci.isim} {y.ogrenci.soyisim}" if y.ogrenci else "Bilinmiyor",
                    str(y.sinif_id or ""), 
                    y.sinif.sinif_adi if y.sinif else "Bilinmiyor",
                    y.tarih.strftime("%Y-%m-%d %H:%M") if y.tarih else "", y.durum or "", y.aciklama or ""
                ])
            ws.clear()
            if data:
                ws.update(values=data, range_name=f"A1:I{len(data)}")

            # 5. ÖN KAYITLAR
            ws = get_or_create_worksheet(sheet, "Ön Kayıtlar")
            data = []
            headers = ["Akademi Adı", "Kayıt ID", "İsim", "Soyisim", "Veli İsim", "Telefon", "Branş", "Durum", "Notlar", "Tarih"]
            for akademi in akademiler:
                items = db.query(models.OnKayit).filter(models.OnKayit.akademi_adi == akademi.name).all()
                append_academy_data(data, akademi.name, headers, items, lambda ok: [
                    ok.akademi_adi or "", str(ok.id), ok.ogrenci_adi or "", ok.ogrenci_soyadi or "", 
                    f"{ok.veli_adi or ''} {ok.veli_soyadi or ''}".strip(), ok.telefon or "", ok.ilgilenilen_brans or "", 
                    ok.durum or "", ok.notlar or "", ok.eklenme_tarihi.strftime("%Y-%m-%d %H:%M") if ok.eklenme_tarihi else ""
                ])
            ws.clear()
            if data:
                ws.update(values=data, range_name=f"A1:J{len(data)}")

            # 6. AKADEMİLER
            ws = get_or_create_worksheet(sheet, "Akademiler")
            data = []
            headers = ["Akademi ID", "Akademi Adı", "Eklenme Tarihi", "WhatsApp No"]
            items = db.query(models.Akademi).order_by(models.Akademi.name).all()
            if items:
                data.append(["--- SİSTEMDEKİ AKADEMİLER ---", "", "", ""])
                data.append(headers)
                for a in items:
                    data.append([str(a.id), a.name or "", a.eklenme_tarihi.strftime("%Y-%m-%d %H:%M") if a.eklenme_tarihi else "", a.whatsapp_phone_number or ""])
            ws.clear()
            if data:
                ws.update(values=data, range_name=f"A1:D{len(data)}")

            print(f"[{datetime.now()}] Yedekleme Tamamlandı! Tüm tablolar başarıyla Google Sheets'e aktarıldı.")
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"[{datetime.now()}] Genel yedekleme hatası: {e}")
