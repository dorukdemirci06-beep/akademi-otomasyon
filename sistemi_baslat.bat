@echo off
title Akademi Otomasyonu Baslatiliyor
color 0A

:: Betigin kendi bulundugu klasoru calisma dizini olarak ayarla
cd /d "%~dp0"

echo =======================================================
echo          AKADEMI OTOMASYONU BASLATILIYOR...
echo =======================================================
echo.
echo Lutfen bekleyin, servisler arka planda aciliyor...
echo.

:: Backend'i yeni bir pencerede baslat
echo [1/2] Backend (API Sunucusu) baslatiliyor...
start "Akademi Backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Frontend'i yeni bir pencerede baslat
echo [2/2] Frontend (Arayuz) baslatiliyor...
start "Akademi Frontend" cmd /k "cd frontend && npm run dev -- --host"

:: Yerel ag IP adresini bul
for /f "delims=[] tokens=2" %%a in ('ping -4 -n 1 %COMPUTERNAME% ^| findstr "["') do set LOCAL_IP=%%a

echo.
echo Sunucularin ayaga kalkmasi icin 4 saniye bekleniyor...
timeout /t 4 /nobreak > nul

echo.
echo Tarayici ag baglantisi (http://%LOCAL_IP%:5173) uzerinden aciliyor...
start http://%LOCAL_IP%:5173

echo.
echo =======================================================
echo HER SEY HAZIR! 
echo =======================================================
echo Ekrana acilan diger 2 siyah pencereyi (Backend ve Frontend) LUTFEN KAPATMAYIN.
echo Onlari simge durumuna kucultebilirsiniz.
echo.
echo Diger cihazlardan sisteme girmek icin tarayiciya su adresi yazin:
echo http://%LOCAL_IP%:5173
echo.
pause
