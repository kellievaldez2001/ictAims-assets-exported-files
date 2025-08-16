#!/bin/bash

echo "🚀 MySQL servisi başlatılıyor..."

# MySQL servisinin durumunu kontrol et
if sudo mysql.server status > /dev/null 2>&1; then
    echo "✅ MySQL zaten çalışıyor!"
    exit 0
fi

# MySQL servisini başlat
if sudo mysql.server start; then
    echo "✅ MySQL başarıyla başlatıldı!"
    
    # 3 saniye bekle ve durumu kontrol et
    sleep 3
    
    if sudo mysql.server status > /dev/null 2>&1; then
        echo "✅ MySQL servisi aktif ve çalışıyor!"
    else
        echo "⚠️ MySQL başlatıldı ancak durum kontrolünde sorun var"
    fi
else
    echo "❌ MySQL başlatılamadı!"
    echo "🔧 Lütfen şu adımları kontrol edin:"
    echo "   1. MySQL kurulu mu?"
    echo "   2. Yetki sorunları var mı?"
    echo "   3. Port 3306 kullanımda mı?"
    exit 1
fi 