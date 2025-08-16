const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here if you have one
  port: 3306,
  database: 'inventory_db'
};

async function testInsert() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL successfully');
    
    // Test data that matches the original error
    const testData = {
      asset_name: 'Test Device',
      category: 'ICT',
      subcategory: 'Server',
      quantity: 1,
      supplier: 'Test Supplier',
      acquisition_date: '2025-01-09',
      unit_cost: 100.00,
      total_cost: 100.00,
      document_number: 'TEST001',
      location: 'Test Location',
      remarks: 'Test insertion'
    };
    
    console.log('🧪 Testing insertion with data:', testData);
    
    // Test the INSERT statement that was failing
    const [result] = await connection.execute(
      `INSERT INTO asset_acquisitions (
        asset_name, category, subcategory, quantity, supplier, acquisition_date, unit_cost, total_cost, document_number, location, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testData.asset_name, testData.category, testData.subcategory, testData.quantity, 
        testData.supplier, testData.acquisition_date, testData.unit_cost, testData.total_cost, 
        testData.document_number, testData.location, testData.remarks
      ]
    );
    
    console.log('✅ Test insertion successful!');
    console.log(`📝 Inserted record with ID: ${result.insertId}`);
    
    // Verify the data was inserted correctly
    console.log('\n🔍 Verifying inserted data...');
    const [rows] = await connection.execute(
      'SELECT * FROM asset_acquisitions WHERE id = ?',
      [result.insertId]
    );
    
    if (rows.length > 0) {
      const insertedRecord = rows[0];
      console.log('📋 Inserted record details:');
      console.log(`  - ID: ${insertedRecord.id}`);
      console.log(`  - Asset Name: ${insertedRecord.asset_name}`);
      console.log(`  - Category: ${insertedRecord.category}`);
      console.log(`  - Sub Category: ${insertedRecord.subcategory}`);
      console.log(`  - Quantity: ${insertedRecord.quantity}`);
      console.log(`  - Supplier: ${insertedRecord.supplier}`);
      console.log(`  - Acquisition Date: ${insertedRecord.acquisition_date}`);
      console.log(`  - Unit Cost: ${insertedRecord.unit_cost}`);
      console.log(`  - Total Cost: ${insertedRecord.total_cost}`);
      console.log(`  - Document Number: ${insertedRecord.document_number}`);
      console.log(`  - Location: ${insertedRecord.location}`);
      console.log(`  - Remarks: ${insertedRecord.remarks}`);
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await connection.execute('DELETE FROM asset_acquisitions WHERE id = ?', [result.insertId]);
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! The table is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testInsert().catch(console.error); 