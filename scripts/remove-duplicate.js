const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  port: 3306,
  database: 'inventory_db'
};

async function removeDuplicateColumn() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL successfully');
    
    // Check current table structure
    console.log('🔍 Current table structure:');
    const [columns] = await connection.execute('DESCRIBE asset_acquisitions');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Remove the duplicate 'subcategory' column (without underscore)
    console.log('\n🧹 Removing duplicate subcategory column...');
    await connection.execute('ALTER TABLE asset_acquisitions DROP COLUMN subcategory');
    console.log('✅ Duplicate column removed');
    
    // Final table structure
    console.log('\n🔍 Final clean table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE asset_acquisitions');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n🎉 Duplicate column removal completed successfully!');
    
  } catch (error) {
    console.error('❌ Error removing duplicate column:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the cleanup
removeDuplicateColumn().catch(console.error); 