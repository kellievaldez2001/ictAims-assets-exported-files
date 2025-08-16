# MySQL GUI Kullanım Kılavuzu - InventoryAppV2

Bu kılavuz, InventoryAppV2 projesi için MySQL veritabanını yönetmek üzere kurduğumuz MySQL GUI aracının nasıl kullanılacağını açıklar.

## 🚀 Kurulum

Projeye gerekli MySQL GUI araçları kurulmuştur:

```bash
npm install mysql2
npm install -g admin-mongo
npm install -g mysql-gui
```

## 🔌 MySQL Veritabanına Bağlanma

### 1. MySQL Servisini Başlatma

Öncelikle MySQL servisini başlatın:

```bash
sudo mysql.server start
```

### 2. MySQL GUI Aracını Çalıştırma

Terminal'de şu komutu çalıştırın:

```bash
mysql-gui
```

### 3. Bağlantı Bilgileri

MySQL GUI açıldığında aşağıdaki bağlantı bilgilerini kullanın:

- **Host:** `localhost` veya `127.0.0.1`
- **Port:** `3306` (varsayılan MySQL portu)
- **Username:** `root` (veya MySQL kurulumunuzda belirlediğiniz kullanıcı adı)
- **Password:** MySQL kurulumunuzda belirlediğiniz şifre
- **Database:** `inventory_db` (veya projenizde kullandığınız veritabanı adı)

## 📊 Veritabanı Yapısı

InventoryAppV2 projesi aşağıdaki ana tabloları kullanır:

### Assets (Varlıklar) Tablosu
- `id` - Varlık ID'si
- `name` - Varlık adı
- `category` - Kategori
- `serial_number` - Seri numarası
- `department` - Departman
- `location` - Konum
- `custodian_id` - Sorumlu kişi ID'si
- `status` - Durum
- `purchase_cost` - Satın alma maliyeti
- `acquisition_date` - Edinim tarihi
- `created_at` - Oluşturulma tarihi
- `updated_at` - Güncellenme tarihi

### Custodians (Sorumlular) Tablosu
- `id` - Sorumlu ID'si
- `name` - Ad
- `email` - E-posta
- `phone_number` - Telefon numarası
- `position_designation` - Pozisyon/Unvan
- `department` - Departman
- `date_registered` - Kayıt tarihi
- `created_at` - Oluşturulma tarihi

### Departments (Departmanlar) Tablosu
- `id` - Departman ID'si
- `name` - Departman adı
- `description` - Açıklama
- `created_at` - Oluşturulma tarihi

## 🛠️ MySQL GUI ile Yapabilecekleriniz

### 1. Veri Görüntüleme
- Tabloları seçin ve verileri görüntüleyin
- SQL sorguları yazın ve çalıştırın
- Veri filtreleme ve sıralama yapın

### 2. Veri Düzenleme
- Mevcut kayıtları güncelleyin
- Yeni kayıtlar ekleyin
- Kayıtları silin

### 3. Veritabanı Yönetimi
- Yeni tablolar oluşturun
- Tablo yapılarını değiştirin
- İndeksler ekleyin
- Yedekleme ve geri yükleme yapın

## 📝 Örnek SQL Sorguları

### Tüm Varlıkları Listeleme
```sql
SELECT * FROM assets ORDER BY created_at DESC;
```

### Belirli Bir Departmandaki Varlıkları Listeleme
```sql
SELECT a.*, c.name as custodian_name 
FROM assets a 
LEFT JOIN custodians c ON a.custodian_id = c.id 
WHERE a.department = 'IT';
```

### Sorumlu Kişileri Departmanlarına Göre Gruplama
```sql
SELECT department, COUNT(*) as custodian_count 
FROM custodians 
GROUP BY department;
```

### Son 30 Günde Eklenen Varlıkları Listeleme
```sql
SELECT * FROM assets 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## 🔍 Veri Sorunlarını Giderme

### Tarih Alanları
Eğer tarih alanlarında sorun yaşıyorsanız, aşağıdaki sorguyu kullanarak kontrol edin:

```sql
SELECT id, name, acquisition_date, created_at, updated_at 
FROM assets 
WHERE acquisition_date IS NOT NULL 
LIMIT 10;
```

### Eksik Veriler
Eksik verileri kontrol etmek için:

```sql
SELECT COUNT(*) as total_assets,
       COUNT(custodian_id) as assets_with_custodian,
       COUNT(department) as assets_with_department
FROM assets;
```

## ⚠️ Önemli Notlar

1. **Yedekleme:** Veritabanında değişiklik yapmadan önce mutlaka yedek alın
2. **Test Ortamı:** Önemli değişiklikleri önce test ortamında deneyin
3. **Güvenlik:** Üretim ortamında root kullanıcısı yerine sınırlı yetkili kullanıcı kullanın
4. **Performans:** Büyük tablolarda sorgu çalıştırırken LIMIT kullanın

## 🆘 Sorun Giderme

### Bağlantı Hatası
- MySQL servisinin çalıştığından emin olun
- Port 3306'nın açık olduğunu kontrol edin
- Kullanıcı adı ve şifrenin doğru olduğunu doğrulayın

### Yetki Hatası
- Kullanıcının veritabanına erişim yetkisi olduğundan emin olun
- Gerekirse root kullanıcısı ile bağlanın

### Performans Sorunları
- Büyük sorguları optimize edin
- İndeksler ekleyin
- Gereksiz veri çekmeyin

## 📚 Faydalı Komutlar

### MySQL Servis Yönetimi
```bash
# MySQL'i başlat
sudo mysql.server start

# MySQL'i durdur
sudo mysql.server stop

# MySQL durumunu kontrol et
sudo mysql.server status

# MySQL'i yeniden başlat
sudo mysql.server restart
```

### Veritabanı Yedekleme
```bash
# Veritabanını yedekle
mysqldump -u root -p inventory_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Yedeği geri yükle
mysql -u root -p inventory_db < backup_file.sql
```

## 🎯 Sonraki Adımlar

1. MySQL GUI aracını açın ve veritabanına bağlanın
2. Mevcut tabloları inceleyin
3. Örnek sorguları deneyin
4. Veri yapısını anlayın
5. Gerekli optimizasyonları yapın

Bu kılavuz ile MySQL veritabanınızı kolayca yönetebilir ve InventoryAppV2 projenizin veri ihtiyaçlarını karşılayabilirsiniz. 