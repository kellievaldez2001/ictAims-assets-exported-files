const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  port: 3306,
  database: 'inventory_db'
};

async function fixAssetAcquisitionsTable() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL successfully');
    
    // Check if the table exists
    console.log('🔍 Checking if asset_acquisitions table exists...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'asset_acquisitions'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Table asset_acquisitions does not exist. Creating it...');
      
      // Create the table with all required columns
      await connection.execute(`
        CREATE TABLE asset_acquisitions (
          id int(11) NOT NULL AUTO_INCREMENT,
          asset_name varchar(255) NOT NULL,
          category varchar(100) NOT NULL,
          subcategory varchar(100) DEFAULT NULL,
          quantity int(11) NOT NULL DEFAULT 1,
          supplier varchar(255) DEFAULT NULL,
          acquisition_date date DEFAULT NULL,
          unit_cost decimal(10,2) DEFAULT NULL,
          total_cost decimal(10,2) DEFAULT NULL,
          document_number varchar(100) DEFAULT NULL,
          location varchar(255) DEFAULT NULL,
          remarks text,
          created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table asset_acquisitions created successfully');
    } else {
      console.log('✅ Table asset_acquisitions exists');
      
      // Check if subcategory column exists
      console.log('🔍 Checking if subcategory column exists...');
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM asset_acquisitions LIKE 'subcategory'"
      );
      
      if (columns.length === 0) {
        console.log('❌ subcategory column does not exist. Adding it...');
        
        // Add the missing column
        await connection.execute(
          "ALTER TABLE asset_acquisitions ADD COLUMN subcategory varchar(100) DEFAULT NULL AFTER category"
        );
        console.log('✅ subcategory column added successfully');
      } else {
        console.log('✅ subcategory column already exists');
      }
    }
    
    // Verify the final table structure
    console.log('\n🔍 Final table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE asset_acquisitions');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n🎉 Asset acquisitions table is now ready!');
    
  } catch (error) {
    console.error('❌ Error fixing asset_acquisitions table:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied - check username/password');
      console.error('   Update the password in this script if needed');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 MySQL connection refused - service might not be running');
      console.error('   Try: sudo mysql.server start');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database inventory_db does not exist');
      console.error('   Create it first: CREATE DATABASE inventory_db;');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixAssetAcquisitionsTable().catch(console.error); 