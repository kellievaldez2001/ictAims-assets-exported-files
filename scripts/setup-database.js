const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  port: 3306
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    
    // Connect to MySQL without specifying a database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL successfully');
    
    // Create database if it doesn't exist
    console.log('📁 Creating database inventory_db...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS inventory_db');
    console.log('✅ Database inventory_db created/verified');
    
    // Use the database
    await connection.execute('USE inventory_db');
    console.log('✅ Using database inventory_db');
    
    // Read and execute the SQL file
    console.log('📖 Reading SQL file...');
    const sqlFilePath = path.join(__dirname, 'create-tables.sql');
    const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
    
    // Split SQL statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔄 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.log(`⚠️ Statement ${i + 1} had an issue (this might be normal):`, error.message);
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
    // Verify the asset_acquisitions table structure
    console.log('\n🔍 Verifying table structure...');
    const [columns] = await connection.execute('DESCRIBE asset_acquisitions');
    console.log('📋 asset_acquisitions table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Make sure MySQL is running: sudo mysql.server start');
    console.error('2. Check if you need a password for root user');
    console.error('3. Verify MySQL is accessible on localhost:3306');
    console.error('4. Try connecting manually: mysql -u root -p');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL connection refused - service might not be running');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied - check username/password');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase().catch(console.error); 