#!/bin/bash

# Yedekleme dizini
BACKUP_DIR="/backup/printbroker"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/$DATE"

# Dizin oluştur
mkdir -p "$BACKUP_PATH"

# Veritabanı yedeği
echo "Veritabanı yedeği alınıyor..."
PGPASSWORD=$POSTGRES_PASSWORD pg_dump -h localhost -U $POSTGRES_USER -d $POSTGRES_DB | gzip > "$BACKUP_PATH/database.sql.gz"

# Redis yedeği
echo "Redis yedeği alınıyor..."
redis-cli SAVE
cp /var/lib/redis/dump.rdb "$BACKUP_PATH/redis.rdb"

# Dosya yedeği
echo "Dosya yedeği alınıyor..."
tar -czf "$BACKUP_PATH/uploads.tar.gz" /app/uploads

# Yedekleme bilgilerini kaydet
echo "Yedekleme bilgileri kaydediliyor..."
cat > "$BACKUP_PATH/info.txt" << EOF
Yedekleme Tarihi: $(date)
Veritabanı: $POSTGRES_DB
Redis: dump.rdb
Dosyalar: uploads.tar.gz
EOF

# Eski yedekleri temizle (30 günden eski)
echo "Eski yedekler temizleniyor..."
find "$BACKUP_DIR" -type d -mtime +30 -exec rm -rf {} \;

# Yedekleme durumunu kontrol et
if [ $? -eq 0 ]; then
    echo "Yedekleme başarıyla tamamlandı: $BACKUP_PATH"
    
    # Başarılı yedekleme bildirimi gönder
    curl -X POST -H "Content-Type: application/json" \
         -d "{\"message\":\"Yedekleme başarıyla tamamlandı: $BACKUP_PATH\"}" \
         $NOTIFICATION_WEBHOOK
else
    echo "Yedekleme sırasında hata oluştu!"
    
    # Hata bildirimi gönder
    curl -X POST -H "Content-Type: application/json" \
         -d "{\"message\":\"Yedekleme sırasında hata oluştu!\"}" \
         $NOTIFICATION_WEBHOOK
fi 