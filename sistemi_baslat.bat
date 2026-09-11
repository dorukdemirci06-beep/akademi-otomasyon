@echo off
title KUYO Baslatiliyor
color 0A

:: Betigin kendi bulundugu klasoru calisma dizini olarak ayarla
cd /d "%~dp0"

echo =======================================================
echo               KUYO BASLATILIYOR...
echo =======================================================
echo.
echo Lutfen bekleyin, servisler arka planda aciliyor...
echo.

:: Backend'i yeni bir pencerede (simge durumunda) baslat
echo [1/2] Backend (API Sunucusu) baslatiliyor...
start /min "Akademi Backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Frontend'i yeni bir pencerede (simge durumunda) baslat
echo [2/2] Frontend (Arayuz) baslatiliyor...
start /min "Akademi Frontend" cmd /k "cd frontend && npm run dev -- --host"

:: Yerel ag IP adresini bul
for /f "delims=[] tokens=2" %%a in ('ping -4 -n 1 %COMPUTERNAME% ^| findstr "["') do set LOCAL_IP=%%a

echo.
echo Backend sunucusunun (ve veritabaninin) hazir olmasi bekleniyor...
echo (Ilk acilista Neon veritabaninin uyanmasi 15-20 saniye surebilir, lutfen bekleyin)

:wait_backend
curl -s http://localhost:8000 > nul
if errorlevel 1 (
    timeout /t 2 /nobreak > nul
    goto wait_backend
)

echo.
echo Backend hazir! Tarayici ag baglantisi (http://%LOCAL_IP%:5173) uzerinden aciliyor...
start http://%LOCAL_IP%:5173

echo.
echo =======================================================
echo HER SEY HAZIR! 
echo =======================================================
echo LUTFEN DIKKAT: Gorev cubugunda simge durumunda calisan siyah pencereleri (Backend ve Frontend) KAPATMAYIN.
echo Sistemi kullanabilmeniz icin bu servislerin arka planda acik kalmasi gereklidir.
echo.
echo Diger cihazlardan sisteme girmek icin tarayiciya su adresi yazin:
echo http://%LOCAL_IP%:5173
echo.
pause
