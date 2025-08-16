// db_mysql.js
// MySQL connection setup for Node.js backend

const mysql = require('mysql2');

// MySQL bağlantı ayarları - localhost root
const dbConfig = {
  host: '127.0.0.1', // IPv4 kullan, IPv6 sorununu önle
  user: 'root',
  password: '', // Şifre yoksa boş bırakın
  database: 'ict_aims_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Bağlantı havuzu oluştur
const pool = mysql.createPool(dbConfig);

// Bağlantıyı test et
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL bağlantı hatası:', err.message);
    console.log('🔧 Çözüm önerileri:');
    console.log('1. MySQL servisinin çalıştığından emin olun');
    console.log('2. Kullanıcı adı ve şifrenin doğru olduğunu kontrol edin');
    console.log('3. Veritabanının oluşturulduğunu kontrol edin');
    console.log('4. db_mysql.js dosyasındaki bağlantı ayarlarını kontrol edin');
    return;
  }
  
  console.log('✅ MySQL bağlantısı başarılı');
  connection.release();
});

// Promise tabanlı bağlantı havuzu döndür
module.exports = pool.promise(); 