const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  port: 3306,
  database: 'inventory_db'
};

async function cleanupTable() {
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
    
    // Check if there are duplicate columns
    const columnNames = columns.map(col => col.Field);
    const duplicates = columnNames.filter((item, index) => columnNames.indexOf(item) !== index);
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️ Found duplicate columns: ${duplicates.join(', ')}`);
      
      // Remove the duplicate 'subcategory' column (without underscore)
      if (columnNames.includes('subcategory') && columnNames.includes('subcategory')) {
        console.log('🧹 Removing duplicate subcategory column...');
        await connection.execute('ALTER TABLE asset_acquisitions DROP COLUMN subcategory');
        console.log('✅ Duplicate column removed');
      }
    }
    
    // Ensure all required columns exist with correct types
    console.log('\n🔧 Ensuring correct table structure...');
    
    // Check and fix category column (should be NOT NULL)
    const categoryColumn = columns.find(col => col.Field === 'category');
    if (categoryColumn && categoryColumn.Null === 'YES') {
      console.log('🔧 Making category column NOT NULL...');
      await connection.execute('ALTER TABLE asset_acquisitions MODIFY COLUMN category varchar(100) NOT NULL');
      console.log('✅ Category column updated');
    }
    
    // Check and fix quantity column (should be NOT NULL with default)
    const quantityColumn = columns.find(col => col.Field === 'quantity');
    if (quantityColumn && quantityColumn.Null === 'YES') {
      console.log('🔧 Making quantity column NOT NULL with default...');
      await connection.execute('ALTER TABLE asset_acquisitions MODIFY COLUMN quantity int(11) NOT NULL DEFAULT 1');
      console.log('✅ Quantity column updated');
    }
    
    // Check and fix created_at and updated_at columns
    const createdAtColumn = columns.find(col => col.Field === 'created_at');
    if (!createdAtColumn) {
      console.log('🔧 Adding created_at column...');
      await connection.execute('ALTER TABLE asset_acquisitions ADD COLUMN created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP');
      console.log('✅ created_at column added');
    }
    
    const updatedAtColumn = columns.find(col => col.Field === 'updated_at');
    if (!updatedAtColumn) {
      console.log('🔧 Adding updated_at column...');
      await connection.execute('ALTER TABLE asset_acquisitions ADD COLUMN updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
      console.log('✅ updated_at column added');
    }
    
    // Final table structure
    console.log('\n🔍 Final clean table structure:');
    const [finalColumns] = await connection.execute('DESCRIBE asset_acquisitions');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    console.log('\n🎉 Table cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error cleaning up table:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the cleanup
cleanupTable().catch(console.error); 