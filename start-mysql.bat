@echo off
echo 🚀 MySQL servisi başlatılıyor...

REM MySQL servisinin durumunu kontrol et
sc query mysql >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MySQL servisi bulundu!
    
    REM MySQL servisini başlat
    net start mysql
    if %errorlevel% equ 0 (
        echo ✅ MySQL başarıyla başlatıldı!
        timeout /t 3 /nobreak >nul
        
        REM Durumu kontrol et
        sc query mysql | find "RUNNING" >nul
        if %errorlevel% equ 0 (
            echo ✅ MySQL servisi aktif ve çalışıyor!
        ) else (
            echo ⚠️ MySQL başlatıldı ancak durum kontrolünde sorun var
        )
    ) else (
        echo ❌ MySQL başlatılamadı!
        echo 🔧 Lütfen şu adımları kontrol edin:
        echo    1. MySQL kurulu mu?
        echo    2. Yetki sorunları var mı?
        echo    3. Port 3306 kullanımda mı?
        pause
        exit /b 1
    )
) else (
    echo ❌ MySQL servisi bulunamadı!
    echo 🔧 Lütfen MySQL'in kurulu olduğundan emin olun
    pause
    exit /b 1
) 