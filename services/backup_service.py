import os
import json
import zipfile
import gspread
from cryptography.fernet import Fernet
from google.oauth2.service_account import Credentials
from sqlalchemy.orm import Session, joinedload
from datetime import datetime, date
from database import SessionLocal
import models
from config import settings
from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from logger import get_logger

load_dotenv()
logger = get_logger("backup_service")

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

DEFAULT_GOOGLE_SHEET_ID = "1pRkD5cp_B_eQwN1xbCm_8w_TKeV-bxJjfkj6nsdKkhw"
ENCRYPTED_GOOGLE_CREDENTIALS = "gAAAAABq52YxhlOgfUht0CWbmW_2YGdQR3OkiWjpVXjUvx6mCqX25VAhDls04AiQuRbKmTrZfrGBHH9kZnhYsKrLBwfg0h1wt2t1gBTGSnJiL-UJpqoaclsanyBjgXQxxf59IJo_lgWO7T444VjwiJd6ikVeHt52q6cMlfUSnFhYXYQz7ssaR08YoHX_ECfs1pQsS5ZLxC-ctTKIT9VvfK_jmebeF4Jscr64LZGDVJNXK08vXhG7rJC_DVrhNFwDipBqlZxPMEZN7mUaFp9AbRv-4zo9AyeF48QWOELCEy0C8z2Deq1j_KDmmu9qgvBOYIgsYct0nNmwme4mggyl5EiNt81nr_kvIb0j8sMEfKANyk_CV-mZadCJdPgliCEFxRG4L3SZIUUjereKYk54xDnZ5Xfw6ctZWhJ1tL6rbW94yWCseSw63xWuvAKg_6G4oRTPl6EpLwMS5Z6Euaw6vILWmbTowGHythe23rnAy5Eamm2FS7Q_Thu-BpOyjji65SLESdZdtsR3Jd4Gfn8Fiwuly4tSV12MguAw4mct_sxjtfPfbHAuynku7d3YJB-gdYgqU_TwzSkmM1T9LEBbTzbiBPcR0PMIGSueE1W-Bnaxo2Vf_mRxO4-JDlXWNA28dxEnkEesf9yHS4gX09ITmGZupzoC2k0srOB3PXBFzlRzpW4RqkPkXzNK1tOIgVLfZF1J5IsErvMTnSoJ-xepEy7uxSYJh9b5ACO4DSVN2F0Xl3q5oaqT04YIl8zUkqdp33mgiD2usBdTfCerTroCkvsRwtn2AoveIdG1_sAHD2KHqgi5Iw03SAXY-1wmWX3XqQsqasr-X4oc1zvbxfZC4M55WLhFHgPfjUBb7lpiT84_k9PZ8ERBqh1aeEpcZpSzrXqgy6oLGO_UMNYNUPTViCLZYZRNet8xawSvbf9oTvOJRi7WeR2prcekDovtmEYJaM415JlKp7l03M8McTz6kICNNSe_Jl-WuVG-Md5dsPGBsmYwJqjiX0jUS8B9DIV-MrG0JIDeJyh6RLhvMS4_q6L5t8-Mhghg7DroDvw3eH7JWuu5olFdiMwHgvNjVBspnn-V9oQnE1Ppr-hPsrH2zRFjJ7MkNSth3S7QEktNSKT-SSC89D5NqJ_-y_RK83R0ZdRtArSKWiMu9U4hWgAoLg0-M0yBYejIAKHiQiqpauih5B6AJLO6hLrUn5ec6E-8khFWl5iT0JLCVGM6p39XvB-4wHkPxwpZCgyWPXScfw0bTrSRPT397SykOBOBbGwpaFHi0GbVqcyp76eQr-0u_VMXqUcJ93eXbrhiTvrc_BjDFngeyW8JHpieO1yHrqOfYH7y_1TsrbXKhzISMmrLeAQ3p3RL-AGsGVoobdHQnYwQlvVQFNViXxlv3QEVhxcqWywiINsaEEsOgvFlU7Ejrd8V6Z5zSBXMnwg4SiUOiIavJ3WabGcnq3c5Um8fUOU2Zh__CNW-P1Fr3C-EKF5kkGtX_TSRVCQ88cFQqqEiJyLwQosrzPmoeuHwndyaVWR2cwJCDceUwwP1RKoSezeTMIRlj7-baI3TAgIlPx4mNNiUWpwXYbjDTEmFfk6KFVcTmgbu7tBWewVB-hApWsLX1mzD6wsAvD75hf8Te47xNlXoBYN_yw54-Qb-WJiYVgxaD04zigpirQ29_5Esmq1lxKsu-7DY4Qdn8Lpym6HinrKj9OvWmm7wJD74o9N49vpKfoJRqTl1-5Rcdv6_yW_Or2O63ZI_sZ-vWO8nEF-DpHD5Ld6x5VpdogJMYOXxR4BcUvWx2w5d_9GCkAsLlu0d-fiFjfL0x0ic2H8WkcGLoXbKPFAVXBlO9lbVxMvYKWIq8Ox1WN80zlq_Rw3AMwGen4sw2slR0-hRlp6dUKepdSmLeB3PxCv1KihEwAFFAo2iX8qTXIMqCWtZj6J0dJj_8tG8thqrr3nr1Wcq7zNGVe6PiyFOCz3l4Nocxn_m_BAhWg1r4YN22lkjLmCB5YhnC6K0Xg-xNQ27iTe5Dd0yE2uSfJn3pjdmhYh_YdpBV6KMHKr1dAzR8sDWEg8TeNMOM7V0Ac9G5GUJV0bErIjsBCHsfZZo8p6XvWzOXEw0Cxvk5eU2B3RQSEyZr2EYtq9-YYIFUqmVgNeywFIjAF7hUvdlWG9ZQuEtBtPWpLiDIYNTszF99PDN1_yEd1sGU1TXM982RyQbJx4DysTC8zg2NaYz87BgpXjVGL9gY471xbXu1xL93WFzjLNjMuChgjc8vEK9sAxrkE4-cIZA94HQuazKRQ9B0iyrZFndE7ztbTmGARhNF6BH5t4VKR2IztkmWctUGO0VKb1JY_G4CiMoVq6K8KNJk3mvjePHEplwkP09WOhnJP5V_5oRanICA-OxDGr1hmWF813K-NxQW5hZff9IvmAPwXgL8zOIABAdqfdqsuwgYLHNUX5NgtUthmBCSSrz4U4D8Ipku_eAznBi8hhLYYCuqJvJrCSHPjNhYoLJDU4KwpJ6RrLrACMQ3KuIVYNqxDAxAY-fTMtWJTmkRlvrgKz0Gljn2EXAOWZ19fUbokzlRQjdp5z1g2OEPoL_33Zje2uzmyByQbfrpRL2EcSmCC43pI7O0xfi5igRvCJvyB0zG75JXCaTh7HjUkm80SjB6yvnTqPJMX5Ng_zq0zq9a1w6W9lq7xqxb6586QwU2Qs_w9WamUiYLJ3cpRxh5nrbQMXR1xEOVMh4k-df_yvYc9_F1o94ZE2iRGJ5D4r5OJ6nUC2Mt79MysG7Re50kM7twzG8fj1QNN29FN5xA17qoCJNl3_9qKrDaRBkI_wyw4laTCTFYgtc7EBx1PTj9NydrOHZoSJhRZCzWxEBFkGdy_0E4lijD3iTElfxWPxNU5gSp6dKFX2EHckzcd9d1vfLOI88nKyd1KWi4CGkUWI6UAq0lzFKIqaFDhRLFU0EroTE89PGLIwyDwI-wM0f3XbT2-DiO9EDfQY2TbMZGRhScoNGde4NfGAf5hBBHOyp3oGSw3IMMaAdPzkrJvEGEgrKOtfbZOKskNu1slruVWCzmP1ff-DxJH4JnOQ4lOWwrU2L_Gha70wq7zX3rtxmKsjX_ZsoMiF4KowPYLVy5C9Xs-pgjRRNeRN3wYnsJdSHE5fkXhPYe7UJ-26klsjBv9tKRRu7SvIkAyPky2RLdXX2SeSGTC9R7B0rtLgYvj8TVSJ8a9IHnb7x"


def get_google_credentials():
    cred_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials.json")
    secret_cred_file = "/etc/secrets/credentials.json"

    if os.path.exists(cred_file):
        return Credentials.from_service_account_file(cred_file, scopes=SCOPES)
    if os.path.exists(secret_cred_file):
        return Credentials.from_service_account_file(secret_cred_file, scopes=SCOPES)

    env_json = os.getenv("GOOGLE_CREDENTIALS_JSON")
    if env_json:
        return Credentials.from_service_account_info(json.loads(env_json), scopes=SCOPES)

    if ENCRYPTED_GOOGLE_CREDENTIALS and settings.ENCRYPTION_KEY:
        fernet = Fernet(settings.ENCRYPTION_KEY.encode())
        decrypted = fernet.decrypt(ENCRYPTED_GOOGLE_CREDENTIALS.encode("utf-8")).decode("utf-8")
        return Credentials.from_service_account_info(json.loads(decrypted), scopes=SCOPES)

    return None


def get_or_create_worksheet(sheet, title, existing_map=None):
    if existing_map and title in existing_map:
        return existing_map[title]
    try:
        return sheet.worksheet(title)
    except gspread.exceptions.WorksheetNotFound:
        return sheet.add_worksheet(title=title, rows="1000", cols="25")


def col_letter(n: int) -> str:
    string = ""
    while n > 0:
        n, remainder = divmod(n - 1, 26)
        string = chr(65 + remainder) + string
    return string


def create_database_dump(db: Session) -> str:
    """Veritabanındaki tüm tabloları okur, JSON'a çevirir ve sıkıştırarak ZIP oluşturur."""
    logger.info("JSON veritabanı yedeği hazırlanıyor...")
    backup_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backups")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    json_path = os.path.join(backup_dir, f"backup_{timestamp}.json")
    zip_path = os.path.join(backup_dir, f"akademi_db_backup_{timestamp}.zip")
    
    all_data = {}
    model_classes = [
        models.Akademi, models.Kullanici, models.Ogrenci, models.Sinif, models.OgrenciSinif,
        models.Odeme, models.Yoklama, models.DersProgrami, models.OnKayit, models.Derslik,
        models.Ogretmen, models.Personel, models.Degerlendirme
    ]
    
    for model in model_classes:
        table_name = model.__tablename__
        records = db.query(model).all()
        table_data = []
        for record in records:
            row_dict = {}
            for column in record.__table__.columns:
                val = getattr(record, column.name)
                if isinstance(val, (datetime, date)):
                    row_dict[column.name] = val.isoformat()
                else:
                    row_dict[column.name] = val
            table_data.append(row_dict)
        all_data[table_name] = table_data
        
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
        
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(json_path, arcname=f"backup_{timestamp}.json")
        
    if os.path.exists(json_path):
        os.remove(json_path)
        
    try:
        backups = sorted([f for f in os.listdir(backup_dir) if f.endswith('.zip')])
        while len(backups) > 7:
            old_backup = os.path.join(backup_dir, backups.pop(0))
            os.remove(old_backup)
    except Exception as e:
        logger.error(f"Eski yedekler temizlenirken hata oluştu: {e}")
        
    logger.info(f"JSON veritabanı yedeği oluşturuldu: {zip_path}")
    return zip_path


def backup_all_to_sheets(raise_on_error: bool = False):
    logger.info("Google Sheets Merkezi Yedekleme İşlemi Başladı...")
    
    sheet_id = os.getenv("GOOGLE_SHEET_ID") or DEFAULT_GOOGLE_SHEET_ID
    if not sheet_id:
        msg = "GOOGLE_SHEET_ID bulunamadı, yedekleme atlanıyor."
        logger.warning(msg)
        if raise_on_error:
            raise RuntimeError(msg)
        return

    try:
        credentials = get_google_credentials()
        if not credentials:
            msg = "Google servis hesabı kimlik bilgileri bulunamadı, yedekleme atlanıyor."
            logger.warning(msg)
            if raise_on_error:
                raise RuntimeError(msg)
            return

        client = gspread.authorize(credentials)
        sheet = client.open_by_key(sheet_id)
        existing_ws_map = {ws.title: ws for ws in sheet.worksheets()}
        now_str = datetime.now().strftime("%d.%m.%Y %H:%M")
        
        db = SessionLocal()
        try:
            akademiler = db.query(models.Akademi).order_by(models.Akademi.name).all()
            
            def append_academy_data(data, akademi_name, headers, items, row_mapper):
                if not items:
                    return
                if len(data) > 0:
                    data.append([""] * len(headers))
                data.append([f"--- {akademi_name.upper()} AKADEMİSİ (Son Güncelleme: {now_str}) ---"] + [""] * (len(headers) - 1))
                data.append(headers)
                for item in items:
                    data.append(row_mapper(item))

            def update_ws(title, headers, data):
                ws = get_or_create_worksheet(sheet, title, existing_ws_map)
                ws.clear()
                if data:
                    end_col = col_letter(len(headers))
                    ws.update(values=data, range_name=f"A1:{end_col}{len(data)}")

            # Tüm verileri tek seferde çek (N+1 sorgularını önle)
            all_ogrenciler = db.query(models.Ogrenci).all()
            all_siniflar = db.query(models.Sinif).options(
                joinedload(models.Sinif.derslik)
            ).all()
            all_odemeler = db.query(models.Odeme).options(joinedload(models.Odeme.ogrenci)).all()
            all_yoklamalar = db.query(models.Yoklama).options(
                joinedload(models.Yoklama.ogrenci),
                joinedload(models.Yoklama.sinif)
            ).all()
            all_on_kayitlar = db.query(models.OnKayit).all()
            all_ogretmenler = db.query(models.Ogretmen).all()
            all_personeller = db.query(models.Personel).all()
            all_degerlendirmeler = db.query(models.Degerlendirme).all()
            all_ders_programlari = db.query(models.DersProgrami).options(
                joinedload(models.DersProgrami.sinif),
                joinedload(models.DersProgrami.derslik)
            ).all()

            # 1. ÖĞRENCİLER
            data = []
            headers = [
                "Akademi Adı", "Öğrenci ID", "İsim", "Soyisim", "TC", "Doğum Tarihi",
                "Öğrenci Meslek", "İletişim Kişisi", "Telefon", "E-posta", "Kayıt Tarihi",
                "Durum", "Bakiye", "Anne İsim", "Anne Meslek", "Anne Telefon",
                "Baba İsim", "Baba Meslek", "Baba Telefon"
            ]
            for akademi in akademiler:
                items = [o for o in all_ogrenciler if o.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda o: [
                    o.akademi_adi or "", str(o.id), o.isim or "", o.soyisim or "", o.tc or "",
                    o.dogum_tarihi or "", getattr(o, "meslek", "") or "", getattr(o, "birincil_veli", "Kendisi") or "Kendisi",
                    o.telefon or "", o.eposta or "",
                    o.kayit_tarihi.strftime("%Y-%m-%d %H:%M") if o.kayit_tarihi else "",
                    o.durum or "", str(o.bakiye or 0.0),
                    o.anne_isim or "", o.anne_meslek or "", o.anne_telefon or "",
                    o.baba_isim or "", o.baba_meslek or "", o.baba_telefon or ""
                ])
            update_ws("Öğrenciler", headers, data)

            # 2. SINIFLAR
            data = []
            headers = ["Akademi Adı", "Sınıf ID", "Sınıf Adı", "Öğretmen Adı", "Derslik Bilgisi"]
            
            def get_sinif_derslikler(s):
                derslikler = []
                if getattr(s, "derslik", None) and s.derslik.ad:
                    derslikler.append(s.derslik.ad)
                for p in [dp for dp in all_ders_programlari if dp.sinif_id == s.id]:
                    if p.derslik and p.derslik.ad and p.derslik.ad not in derslikler:
                        derslikler.append(p.derslik.ad)
                return ", ".join(derslikler) if derslikler else "Belirtilmedi"

            def get_sinif_ogretmen(s):
                if getattr(s, "ogretmen_adi", None):
                    return s.ogretmen_adi
                ogretmenler = []
                for p in [dp for dp in all_ders_programlari if dp.sinif_id == s.id]:
                    if p.ogretmen_adi and p.ogretmen_adi not in ogretmenler:
                        ogretmenler.append(p.ogretmen_adi)
                return ", ".join(ogretmenler) if ogretmenler else "Belirtilmedi"
                
            for akademi in akademiler:
                items = [s for s in all_siniflar if s.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda s: [
                    s.akademi_adi or "", str(s.id), s.sinif_adi or "", get_sinif_ogretmen(s), get_sinif_derslikler(s)
                ])
            update_ws("Sınıflar", headers, data)

            # 3. ÖDEMELER
            data = []
            headers = ["Akademi Adı", "Ödeme ID", "Öğrenci ID", "Öğrenci Adı Soyadı", "Tutar", "Tarih", "Yöntem", "Durum", "Tür", "Açıklama"]
            for akademi in akademiler:
                items = [
                    o for o in all_odemeler
                    if (o.ogrenci and o.ogrenci.akademi_adi == akademi.name) or (not o.ogrenci and o.akademi_adi == akademi.name)
                ]
                append_academy_data(data, akademi.name, headers, items, lambda o: [
                    (o.ogrenci.akademi_adi if o.ogrenci else o.akademi_adi) or "", str(o.id), str(o.ogrenci_id or ""), 
                    f"{o.ogrenci.isim} {o.ogrenci.soyisim}" if o.ogrenci else "Bilinmiyor",
                    str(o.tutar or 0.0), 
                    o.tarih.strftime("%Y-%m-%d %H:%M") if o.tarih else "", o.odeme_yontemi or "", o.durum or "", o.odeme_turu or "", o.aciklama or ""
                ])
            update_ws("Ödemeler", headers, data)

            # 4. YOKLAMALAR
            data = []
            headers = ["Akademi Adı", "Yoklama ID", "Öğrenci ID", "Öğrenci Adı Soyadı", "Sınıf ID", "Sınıf Adı", "Tarih", "Durum", "Açıklama"]
            for akademi in akademiler:
                items = [y for y in all_yoklamalar if y.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda y: [
                    y.akademi_adi or "", str(y.id), str(y.ogrenci_id or ""), 
                    f"{y.ogrenci.isim} {y.ogrenci.soyisim}" if y.ogrenci else "Bilinmiyor",
                    str(y.sinif_id or ""), 
                    y.sinif.sinif_adi if y.sinif else "Bilinmiyor",
                    y.tarih.strftime("%Y-%m-%d %H:%M") if y.tarih else "", y.durum or "", y.aciklama or ""
                ])
            update_ws("Yoklamalar", headers, data)

            # 5. ÖN KAYITLAR
            data = []
            headers = [
                "Akademi Adı", "Kayıt ID", "İsim", "Soyisim", "Öğrenci Meslek",
                "Veli İsim", "Veli Meslek", "Telefon", "Doğum Tarihi", "Branş", "Durum", "Notlar", "Tarih"
            ]
            for akademi in akademiler:
                items = [ok for ok in all_on_kayitlar if ok.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda ok: [
                    ok.akademi_adi or "", str(ok.id), ok.ogrenci_adi or "", ok.ogrenci_soyadi or "",
                    getattr(ok, "ogrenci_meslek", "") or "",
                    f"{ok.veli_adi or ''} {ok.veli_soyadi or ''}".strip(),
                    getattr(ok, "veli_meslek", "") or "",
                    ok.telefon or "", ok.dogum_tarihi or "", ok.ilgilenilen_brans or "", 
                    ok.durum or "", ok.notlar or "", ok.eklenme_tarihi.strftime("%Y-%m-%d %H:%M") if ok.eklenme_tarihi else ""
                ])
            update_ws("Ön Kayıtlar", headers, data)

            # 6. AKADEMİLER
            data = []
            headers = ["Akademi ID", "Akademi Adı", "Eklenme Tarihi", "WhatsApp No"]
            if akademiler:
                data.append([f"--- SİSTEMDEKİ AKADEMİLER (Son Güncelleme: {now_str}) ---", "", "", ""])
                data.append(headers)
                for a in akademiler:
                    data.append([str(a.id), a.name or "", a.eklenme_tarihi.strftime("%Y-%m-%d %H:%M") if a.eklenme_tarihi else "", a.whatsapp_phone_number or ""])
            update_ws("Akademiler", headers, data)

            # 7. ÖĞRETMENLER
            data = []
            headers = ["Akademi Adı", "Öğretmen ID", "İsim", "Branş", "Telefon", "E-posta", "Başlama Tarihi", "Durum", "Notlar", "Eklenme Tarihi"]
            for akademi in akademiler:
                items = [o for o in all_ogretmenler if o.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda o: [
                    o.akademi_adi or "", str(o.id), o.isim or "", o.brans or "", o.telefon or "", o.eposta or "", 
                    o.baslama_tarihi or "", o.durum or "", o.notlar or "", 
                    o.eklenme_tarihi.strftime("%Y-%m-%d %H:%M") if o.eklenme_tarihi else ""
                ])
            update_ws("Öğretmenler", headers, data)

            # 8. PERSONELLER
            data = []
            headers = ["Akademi Adı", "Personel ID", "İsim", "Ünvan", "Telefon", "E-posta", "Başlama Tarihi", "Durum", "Notlar", "Eklenme Tarihi"]
            for akademi in akademiler:
                items = [p for p in all_personeller if p.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda p: [
                    p.akademi_adi or "", str(p.id), p.isim or "", p.unvan or "", p.telefon or "", p.eposta or "", 
                    p.baslama_tarihi or "", p.durum or "", p.notlar or "", 
                    p.eklenme_tarihi.strftime("%Y-%m-%d %H:%M") if p.eklenme_tarihi else ""
                ])
            update_ws("Personeller", headers, data)

            # 9. DEĞERLENDİRMELER
            data = []
            headers = ["Akademi Adı", "Değerlendirme ID", "Tür", "Çalışan ID", "İsim", "Ünvan", "Puan", "Kategori", "Notlar", "Tarih"]
            for akademi in akademiler:
                items = [d for d in all_degerlendirmeler if d.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda d: [
                    d.akademi_adi or "", str(d.id), d.tur or "", str(d.calisan_id), d.isim or "", d.unvan or "", 
                    str(d.puan), d.kategori or "", d.notlar or "", 
                    d.tarih.strftime("%Y-%m-%d %H:%M") if d.tarih else ""
                ])
            update_ws("Değerlendirmeler", headers, data)

            # 10. DERS PROGRAMI
            data = []
            headers = ["Akademi Adı", "Program ID", "Sınıf Adı", "Derslik Adı", "Gün", "Başlangıç Saati", "Bitiş Saati", "Ders Adı", "Öğretmen Adı", "Renk"]
            for akademi in akademiler:
                items = [dp for dp in all_ders_programlari if dp.sinif and dp.sinif.akademi_adi == akademi.name]
                append_academy_data(data, akademi.name, headers, items, lambda dp: [
                    akademi.name or "", str(dp.id), 
                    dp.sinif.sinif_adi if dp.sinif else "Bilinmiyor",
                    dp.derslik.ad if dp.derslik else "Belirtilmedi",
                    dp.gun or "", dp.baslangic_saati or "", dp.bitis_saati or "", 
                    dp.ders_adi or "", dp.ogretmen_adi or "", dp.renk or ""
                ])
            update_ws("Ders Programı", headers, data)

            logger.info("Yedekleme Tamamlandı! Tüm tablolar başarıyla Google Sheets'e aktarıldı.")
            
            # --- Veritabanı Yedeği (.zip) yükleme işlemi ---
            drive_folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
            if drive_folder_id:
                logger.info("Tam veritabanı yedeği oluşturuluyor ve Google Drive'a yükleniyor...")
                try:
                    drive_service = build('drive', 'v3', credentials=credentials)
                    zip_path = create_database_dump(db)
                    if os.path.exists(zip_path):
                        filename = os.path.basename(zip_path)
                        file_metadata = {
                            'name': filename,
                            'parents': [drive_folder_id]
                        }
                        media = MediaFileUpload(zip_path, mimetype='application/zip', resumable=True)
                        uploaded_file = drive_service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                        logger.info(f"Veritabanı yedeği ({filename}) başarıyla Google Drive'a yüklendi. Dosya ID: {uploaded_file.get('id')}")
                except Exception as e:
                    logger.error(f"Google Drive'a veritabanı yedeği yüklenirken hata oluştu: {e}")
            
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Genel yedekleme hatası: {e}")
        if raise_on_error:
            raise
