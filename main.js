



// =============================
// Inventory Management System V2 - Electron Main Process
// MySQL Database Integration
// =============================

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { generateAssetHTML, deployToGithub } = require('./scripts/generateAndDeployAssetHtml');

// MySQL connection pool
const mysqlPool = require('./db_mysql');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  });

  mainWindow.loadFile('index.html');
  
  // Handle loading errors
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Page failed to load. Retrying...');
    mainWindow.loadFile('index.html');
  });

  // Open DevTools in development (commented out to prevent auto-opening)
  // mainWindow.webContents.openDevTools();
}

// Database initialization
async function initializeDatabase() {
  try {
    // Test the connection
    await mysqlPool.query('SELECT 1');
    console.log('✅ MySQL database connection successful');
    
    // Check if tables exist and create them if needed
    await ensureTablesExist();
    
  } catch (error) {
    safeLogError('❌ Database initialization failed:', error);
    throw error;
  }
}

async function ensureTablesExist() {
  const tables = [
    'asset_acquisitions',
    'assets', 
    'categories',
    'users_and_roles',
    'departments',
    'history',
    'inventory_movements',
    'users',
    'purchase_orders',
    'stock_adjustments',
    'dashboard_status',
    'asset_assignments'
  ];

  for (const table of tables) {
    try {
      await mysqlPool.query(`SELECT 1 FROM ${table} LIMIT 1`);
      console.log(`✓ Table ${table} exists`);
    } catch (error) {
      console.log(`⚠ Table ${table} does not exist. Please run the migration script first.`);
    }
  }
}

// Safe console logging function to prevent EPIPE errors
function safeLogError(message, error) {
  try {
    console.error(message, error?.message || error || 'Unknown error');
  } catch (consoleErr) {
    // EPIPE hatasını önle
  }
}

// History logging function
async function logHistory({ user, action, details, asset_id = null, asset_name = null }) {
  try {
    await mysqlPool.query(
      'INSERT INTO history (timestamp, user, action, details, asset_id, asset_name) VALUES (NOW(), ?, ?, ?, ?, ?)',
      [user, action, details, asset_id, asset_name]
    );
  } catch (err) {
    safeLogError('Failed to log history:', err);
  }
}

// App lifecycle
app.whenReady().then(async () => {
  try {
    // Initialize MySQL database
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    safeLogError('❌ Failed to initialize database:', error);
    try {
      console.log('\n🔧 MySQL Bağlantı Sorunu Çözümü:');
      console.log('1. MySQL servisinin çalıştığından emin olun');
      console.log('2. Veritabanını oluşturun: CREATE DATABASE inventory_db;');
      console.log('3. SQL migration dosyasını çalıştırın');
      console.log('4. db_mysql.js dosyasındaki ayarları kontrol edin');
      console.log('\n⚠️ Uygulama başlatılıyor ancak veritabanı bağlantısı olmayabilir.');
    } catch (consoleErr) {
      // EPIPE hatasını önle
    }
  }
  
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC event listeners for frontend-backend communication

// --- ASSETS MANAGEMENT ---
ipcMain.handle('get-assets', async () => {
  try {
    // Explicitly select all columns including updated_at
    // Exclude assets that have a LOST or DAMAGED adjustment in stock_adjustments
    const [rows] = await mysqlPool.query(`
      SELECT a.id, a.asset_name, a.category, a.subcategory, a.serial_number, a.department, a.location, a.custodian, a.status, a.purchase_cost, a.acquisition_date, a.date_supplied, a.description, a.useful_life, a.depreciation_method, a.annual_depreciation, a.accumulated_depreciation, a.book_value, a.supplier, a.supplier_contact_person, a.supplier_contact_number, a.supplier_email, a.supplier_address, a.document_number, a.remarks, a.warranty_details, a.created_at, a.updated_at
      FROM assets a
      WHERE a.id NOT IN (
        SELECT sa.asset_id FROM stock_adjustments sa
        WHERE LOWER(sa.adjustment_type) IN ('lost', 'damaged')
      )
      ORDER BY a.created_at DESC
    `);
    return rows;
  } catch (err) {
    safeLogError('Error fetching assets (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-asset', async (event, asset) => {
  try {
    console.log('[main.js] add-asset handler - Received asset data:', asset);
    const {
      asset_name, serial_number, category, subcategory, acquisition_date, date_supplied, status, location, department, description, custodian, purchase_cost, useful_life,
      depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number,
      supplier_email, supplier_address, document_number, remarks, warranty_details
    } = asset;

    console.log('[main.js] add-asset handler - Destructured values:', {
      asset_name, serial_number, category, subcategory, acquisition_date, status, location, department, description, custodian, purchase_cost, useful_life,
      depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number,
      supplier_email, supplier_address, document_number, remarks, warranty_details
    });

  // Use the date string as-is (no conversion) to avoid timezone issues
  let formattedDate = acquisition_date ? acquisition_date.slice(0, 10) : null;
  let formattedSuppliedDate = date_supplied ? date_supplied.slice(0, 10) : null;
  console.log('[main.js] add-asset handler - Formatted date:', formattedDate, 'Date Supplied:', formattedSuppliedDate);


    // Insert or update custodian in users_and_roles (name)
    if (custodian && custodian.trim()) {
      await mysqlPool.query(
        `INSERT INTO users_and_roles (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [custodian.trim()]
      );
    }

    // Insert department if it does not exist
    if (department && department.trim()) {
      const [exists] = await mysqlPool.query('SELECT id FROM departments WHERE department = ?', [department.trim()]);
      if (exists.length === 0) {
        await mysqlPool.query('INSERT INTO departments (department) VALUES (?)', [department.trim()]);
      }
    }

    const [result] = await mysqlPool.query(
      `INSERT INTO assets (
        asset_name, category, subcategory, serial_number, department, location, custodian, status, purchase_cost, acquisition_date, date_supplied, description, useful_life,
        depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number,
        supplier_email, supplier_address, warranty_details, document_number, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        asset_name, category, subcategory, serial_number, department, location, custodian, status || 'Available', purchase_cost, formattedDate, formattedSuppliedDate, description, useful_life,
        depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number,
        supplier_email, supplier_address, warranty_details, document_number, remarks
      ]
    );

    // Fetch the full asset data (including auto-generated fields like id)
    const [rows] = await mysqlPool.query('SELECT * FROM assets WHERE id = ?', [result.insertId]);
    if (rows && rows[0]) {
      generateAssetHTML(rows[0]);
      deployToGithub();
    }

    console.log('[main.js] add-asset handler - SQL query executed successfully, result:', result);

    await logHistory({
      user: 'system',
      action: 'add',
      details: `Added asset: ${asset_name}`,
      asset_id: result.insertId,
      asset_name: asset_name
    });

    return result.insertId;
  } catch (err) {
    console.error('Error adding asset (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('update-asset', async (event, asset) => {
  try {
    const {
      id, asset_name, serial_number, category, subcategory, acquisition_date, date_supplied, status, location, department, description, custodian, purchase_cost, useful_life,
      depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number,
      supplier_email, supplier_address, document_number, remarks, warranty_details
    } = asset;
    
    // Use the date string as-is (no conversion) to avoid timezone issues
    let formattedDate = acquisition_date ? acquisition_date.slice(0, 10) : null;
    // Sync acquisition_date with asset_acquisitions if document_number is provided
    if (document_number) {
      const [acqRows] = await mysqlPool.query('SELECT acquisition_date FROM asset_acquisitions WHERE document_number = ? LIMIT 1', [document_number]);
      if (acqRows && acqRows.length > 0 && acqRows[0].acquisition_date) {
        formattedDate = typeof acqRows[0].acquisition_date === 'string'
          ? acqRows[0].acquisition_date.slice(0, 10)
          : acqRows[0].acquisition_date;
      }
    }
    // Also update asset_acquisitions if asset acquisition_date is changed
    if (document_number && formattedDate) {
      await mysqlPool.query('UPDATE asset_acquisitions SET acquisition_date = ? WHERE document_number = ?', [formattedDate, document_number]);
    }
    let formattedSuppliedDate = date_supplied ? date_supplied.slice(0, 10) : null;

    // Insert department if it does not exist (mirror add-asset logic)
    if (department && department.trim()) {
      const [exists] = await mysqlPool.query('SELECT id FROM departments WHERE department = ?', [department.trim()]);
      if (exists.length === 0) {
        await mysqlPool.query('INSERT INTO departments (department) VALUES (?)', [department.trim()]);
      }
    }

    const [result] = await mysqlPool.query(
      `UPDATE assets SET
        asset_name = ?, serial_number = ?, category = ?, acquisition_date = ?, date_supplied = ?, status = ?, location = ?, department = ?, description = ?, custodian = ?, purchase_cost = ?, useful_life = ?,
        depreciation_method = ?, annual_depreciation = ?, accumulated_depreciation = ?, book_value = ?, supplier = ?, supplier_contact_person = ?, supplier_contact_number = ?,
        supplier_email = ?, supplier_address = ?, document_number = ?, remarks = ?, warranty_details = ?, subcategory = ?
      WHERE id = ?`,
      [
        asset_name, serial_number, category, formattedDate, formattedSuppliedDate, status, location, department, description, custodian, purchase_cost, useful_life,
        depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number,
        supplier_email, supplier_address, document_number, remarks, warranty_details, subcategory, id
      ]
    );

    // Fetch the updated asset data
    const [rows] = await mysqlPool.query('SELECT * FROM assets WHERE id = ?', [id]);
    if (rows && rows[0]) {
      generateAssetHTML(rows[0]);
      deployToGithub();
    }

    await logHistory({
      user: 'system',
      action: 'update',
      details: `Updated asset: ${asset_name}`,
      asset_id: id,
      asset_name: asset_name
    });

    return result.affectedRows;
  } catch (err) {
    console.error('Error updating asset (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-asset', async (event, assetId, assetName) => {
  try {
    const [result] = await mysqlPool.query('DELETE FROM assets WHERE id = ?', [assetId]);
    
    await logHistory({
      user: 'system',
      action: 'delete',
      item: 'asset',
      details: `Deleted asset: ${assetName}`,
      asset_id: assetId,
      asset_name: assetName
    });
    
    return result.affectedRows;
  } catch (err) {
    console.error('Error deleting asset (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('get-asset-by-id', async (event, assetId) => {
  try {
    // Explicitly select all columns including updated_at
    const [rows] = await mysqlPool.query('SELECT id, asset_name, category, subcategory, serial_number, department, location, custodian, status, purchase_cost, acquisition_date, date_supplied, description, useful_life, depreciation_method, annual_depreciation, accumulated_depreciation, book_value, supplier, supplier_contact_person, supplier_contact_number, supplier_email, supplier_address, document_number, remarks, warranty_details, created_at, updated_at FROM assets WHERE id = ?', [assetId]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error fetching asset by ID (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('get-asset-by-qr', async (event, qrCode) => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM assets WHERE qr_code = ?', [qrCode]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error fetching asset by QR (MySQL):', err);
    throw err;
  }
});

// --- CUSTODIANS MANAGEMENT ---
ipcMain.handle('get-custodians', async () => {
  try {
  // Fetch all custodians from users_and_roles table
  const [rows] = await mysqlPool.query('SELECT * FROM users_and_roles ORDER BY id DESC');
  console.log('[get-custodians] Raw DB rows:', rows);
  // Explicitly map and return all fields, including account_type and user_group
  const mapped = rows.map(row => ({
    ...row,
    account_type: row.account_type,
    user_group: row.user_group
  }));
  console.log('[get-custodians] Returning to frontend:', mapped);
  return mapped;
} catch (error) {
  console.error('Error fetching custodians:', error);
  return [];
}
});

ipcMain.handle('add-custodian', async (event, custodian) => {
  try {
    const {
      id_no = null,
      image = null,
      name = null,
      position_designation = null,
      account_type = null,
      email = null,
      phone = null,
      user_group = null,
      department = null,
      employment_status = null,
      system_status = null,
      date_registered = null
    } = custodian;

    // Validate required fields
    if (!name) {
      throw new Error("'name' is a required field for custodian");
    }

    let query, params;
    if (date_registered && date_registered.trim() !== '') {
      query = `INSERT INTO users_and_roles (
        id_no, image, name, position_designation, account_type, email, phone, user_group, department, employment_status, system_status, date_registered
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [id_no, image, name, position_designation, account_type, email, phone, user_group, department, employment_status, system_status, date_registered];
    } else {
      query = `INSERT INTO users_and_roles (
        id_no, image, name, position_designation, account_type, email, phone, user_group, department, employment_status, system_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      params = [id_no, image, name, position_designation, account_type, email, phone, user_group, department, employment_status, system_status];
    }
    const [result] = await mysqlPool.query(query, params);
    return result.insertId;
  } catch (err) {
    try {
      console.error('Error adding custodian (MySQL):', err.message || err);
    } catch (consoleErr) {
      // EPIPE hatasını önle
    }
    throw err;
  }
});

ipcMain.handle('update-custodian', async (event, custodian) => {
  try {
    const {
      id,
      image = null,
      name = null,
      position_designation = null,
      account_type = null,
      email = null,
      phone = null,
      user_group = null,
      department = null,
      employment_status = null,
      system_status = null
    } = custodian;

    // Validate required fields
    if (!id || !name) {
      throw new Error("'id' and 'name' are required fields for updating custodian");
    }

    const [result] = await mysqlPool.query(
      `UPDATE users_and_roles SET
        image = ?, name = ?, position_designation = ?, account_type = ?, email = ?, phone = ?, user_group = ?, department = ?, employment_status = ?, system_status = ?
      WHERE id = ?`,
      [image, name, position_designation, account_type, email, phone, user_group, department, employment_status, system_status, id]
    );
    return result.affectedRows;
  } catch (err) {
    console.error('Error updating custodian (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-custodian', async (event, custodianId, custodianName) => {
  try {
    const [result] = await mysqlPool.query('DELETE FROM users_and_roles WHERE id = ?', [custodianId]);
    return result.affectedRows;
  } catch (err) {
    console.error('Error deleting custodian (MySQL):', err);
    throw err;
  }
});

// --- DEPARTMENTS MANAGEMENT ---
ipcMain.handle('get-departments', async () => {
  try {
    // Remove departments not referenced by any asset
    await mysqlPool.query('DELETE FROM departments WHERE department NOT IN (SELECT DISTINCT department FROM assets WHERE department IS NOT NULL AND department != "")');

    // Update total_assets and assigned_personnel_count columns for each department
    const [departments] = await mysqlPool.query('SELECT * FROM departments');
    for (const dept of departments) {
      const [[{ total_assets }]] = await mysqlPool.query('SELECT COUNT(*) as total_assets FROM assets WHERE department = ?', [dept.department]);
      const [[{ assigned_personnel_count }]] = await mysqlPool.query('SELECT COUNT(DISTINCT custodian) as assigned_personnel_count FROM assets WHERE department = ? AND custodian IS NOT NULL AND custodian != ""', [dept.department]);
      await mysqlPool.query('UPDATE departments SET total_assets = ?, assigned_personnel_count = ? WHERE id = ?', [total_assets, assigned_personnel_count, dept.id]);
    }

    // Fetch all departments again (now only referenced by assets)
    const [rows] = await mysqlPool.query('SELECT * FROM departments ORDER BY department ASC');
    console.log('[get-departments] Raw DB rows:', rows);
    const mapped = rows.map(row => ({
      id: row.id,
      code: row.department,
      name: row.department,
      department: row.department,
      description: row.description,
      personnels: row.personnels,
      assigned_personnel_count: row.assigned_personnel_count,
      total_assets: row.total_assets,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
    console.log('[get-departments] Returning to frontend:', mapped);
    return mapped;
  } catch (err) {
    console.error('Error fetching departments (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-department', async (event, departmentName) => {
  // Accepts either a string (legacy) or an object with name and description
  let name, description;
  if (typeof departmentName === 'string') {
    name = departmentName;
    description = '';
  } else {
    name = departmentName?.name;
    description = departmentName?.description;
  }
  if (!name) throw new Error('Department name required');
  if (description == null) description = '';
  try {
    const [result] = await mysqlPool.query(
      'INSERT INTO departments (department, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  } catch (err) {
    console.error('Error adding department (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('update-department', async (event, { original, code, description }) => {
  if (!code || !description) throw new Error('Department code and description required');
  try {
    // Check for duplicate code (department column)
    const [existingRows] = await mysqlPool.query(
      `SELECT id FROM departments WHERE department = ? AND id != ?`,
      [code, original.id]
    );
    if (existingRows.length > 0) {
      throw new Error('Department code already exists');
    }
    // Update both department (code) and description columns
    const [result] = await mysqlPool.query(
      `UPDATE departments SET department = ?, description = ? WHERE id = ?`,
      [code, description, original.id]
    );
    return result.affectedRows;
  } catch (err) {
    console.error('Error updating department (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-department', async (event, departmentName) => {
  try {
    const [result] = await mysqlPool.query('DELETE FROM departments WHERE department = ?', [departmentName]);
    return result.affectedRows;
  } catch (err) {
    console.error('Error deleting department (MySQL):', err);
    throw err;
  }
});

// --- CATEGORIES MANAGEMENT ---
ipcMain.handle('get-categories', async () => {
  try {
    // Remove categories not referenced by any asset
    await mysqlPool.query('DELETE FROM categories WHERE category_name NOT IN (SELECT DISTINCT category FROM assets WHERE category IS NOT NULL AND category != "")');

    // Update asset_count and subcategories columns for each category
    const [categories] = await mysqlPool.query('SELECT * FROM categories');
    for (const cat of categories) {
      const [[{ asset_count }]] = await mysqlPool.query('SELECT COUNT(*) as asset_count FROM assets WHERE category = ?', [cat.category_name]);
      const [[{ subcategory_count }]] = await mysqlPool.query('SELECT COUNT(DISTINCT subcategory) as subcategory_count FROM assets WHERE category = ? AND subcategory IS NOT NULL AND subcategory != ""', [cat.category_name]);
      await mysqlPool.query('UPDATE categories SET asset_count = ?, subcategories = ? WHERE id = ?', [asset_count, subcategory_count, cat.id]);
    }

    // Fetch all categories again (now only referenced by assets)
    const [rows] = await mysqlPool.query('SELECT * FROM categories ORDER BY category_name ASC');
    console.log('[get-categories] Raw DB rows:', rows);
    const categoriesWithCounts = rows.map(cat => ({
      ...cat,
      asset_count: cat.asset_count,
      subcategories: cat.subcategories
    }));
    console.log('[get-categories] Returning to frontend:', categoriesWithCounts);
    return categoriesWithCounts;
  } catch (err) {
    console.error('Error fetching categories (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-category', async (event, { name }) => {
  try {
    if (!name) throw new Error('Category name required');
    // Accepts optional description
    const description = arguments[1]?.description || '';
    const [result] = await mysqlPool.query(
      'INSERT INTO categories (category_name, description, date_created) VALUES (?, ?, NOW())',
      [name, description]
    );
    return { id: result.insertId, name: name, description };
  } catch (err) {
    console.error('Error adding category (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-category', async (event, { id, name }) => {
  try {
    if (!id && !name) throw new Error('Category ID or name required');
    
    let query, params;
    if (id) {
      query = 'DELETE FROM categories WHERE id = ?';
      params = [id];
    } else {
      query = 'DELETE FROM categories WHERE category = ?';
      params = [name];
    }
    
    const [result] = await mysqlPool.query(query, params);
    
    // Also update assets that use this category
    if (name) {
      await mysqlPool.query('UPDATE assets SET category = NULL WHERE category = ?', [name]);
    }
    
    return { deleted: result.affectedRows };
  } catch (err) {
    console.error('Error deleting category (MySQL):', err);
    throw err;
  }
});

// --- CATEGORY UPDATE ---
ipcMain.handle('update-category', async (event, updatedCategory) => {
  try {
    if (!updatedCategory || !updatedCategory.id) throw new Error('Category ID required');
    const { id, category_name, description } = updatedCategory;
    const [result] = await mysqlPool.query(
      'UPDATE categories SET category_name = ?, description = ? WHERE id = ?',
      [category_name, description, id]
    );
    return { updated: result.affectedRows };
  } catch (err) {
    console.error('Error updating category (MySQL):', err);
    throw err;
  }
});
// --- DASHBOARD ---
ipcMain.handle('get-dashboard-stats', async () => {
  try {
    const [[{ count: totalAssets }]] = await Promise.all([
      mysqlPool.query('SELECT COUNT(*) as count FROM assets')
    ]);
    const [[{ count: availableAssets }]] = await Promise.all([
      mysqlPool.query('SELECT COUNT(*) as count FROM assets WHERE status = "Available"')
    ]);
    const [[{ count: totalCustodians }]] = await Promise.all([
      mysqlPool.query('SELECT COUNT(*) as count FROM users_and_roles')
    ]);
    const [[{ count: pendingTransfers }]] = await Promise.all([
      mysqlPool.query('SELECT COUNT(*) as count FROM asset_assignments WHERE status = "Pending"')
    ]);
    return { totalAssets, availableAssets, totalCustodians, pendingTransfers };
  } catch (err) {
    console.error('Error fetching dashboard stats (MySQL):', err);
    return { totalAssets: 0, availableAssets: 0, totalCustodians: 0, pendingTransfers: 0 };
  }
});

ipcMain.handle('get-dashboard-status', async () => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM dashboard_status ORDER BY id DESC');
    return rows;
  } catch (err) {
    console.error('Error fetching dashboard status (MySQL):', err);
    return [];
  }
});

// --- HISTORY ---
ipcMain.handle('get-history-records', async () => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM history ORDER BY timestamp DESC');
    return rows;
  } catch (err) {
    console.error('Error fetching history records (MySQL):', err);
    return [];
  }
});

ipcMain.handle('get-audit-log', async () => {
  try {
    const [rows] = await mysqlPool.query('SELECT timestamp as date, action, user, item, details FROM history ORDER BY timestamp DESC');
    return rows;
  } catch (err) {
    console.error('Error fetching audit log (MySQL):', err);
    return [];
  }
});

// --- PURCHASE ORDERS ---
ipcMain.handle('get-purchase-orders', async () => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM purchase_orders ORDER BY order_date DESC');
    return rows;
  } catch (err) {
    console.error('Error fetching purchase orders (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-purchase-order', async (event, order) => {
  try {
    const { po_number, supplier, item_category, quantity, amount, total_amount, status, order_date, delivery_date, remarks, quantity_received, asset_name } = order;
    const [result] = await mysqlPool.query(
      `INSERT INTO purchase_orders (po_number, supplier, item_category, quantity, amount, total_amount, status, order_date, delivery_date, remarks, quantity_received, asset_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [po_number, supplier, item_category, quantity, amount, total_amount, status, order_date, delivery_date, remarks, quantity_received, asset_name]
    );
    return result.insertId;
  } catch (err) {
    console.error('Error adding purchase order (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('update-purchase-order', async (event, order) => {
  try {
    let { id, po_number, supplier, item_category, quantity, amount, total_amount, status, order_date, delivery_date, remarks, quantity_received } = order;
    
    // Prevent over-receipt
    if (typeof quantity_received === 'number' && typeof quantity === 'number' && quantity_received > quantity) {
      quantity_received = quantity;
    }
    
    // Enforce correct status based on received/quantity
    if (typeof quantity_received === 'number' && typeof quantity === 'number') {
      if (quantity_received > 0 && quantity_received < quantity) {
        status = 'Partially Received';
      } else if (quantity_received >= quantity) {
        status = 'Received';
      }
    }
    
    const [result] = await mysqlPool.query(
      `UPDATE purchase_orders
       SET po_number = ?, supplier = ?, item_category = ?, quantity = ?, amount = ?, total_amount = ?, status = ?, order_date = ?, delivery_date = ?, remarks = ?, quantity_received = ?
       WHERE id = ?`,
      [po_number, supplier, item_category, quantity, amount, total_amount, status, order_date, delivery_date, remarks, quantity_received, id]
    );
    
    return result.affectedRows;
  } catch (err) {
    console.error('Error updating purchase order (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-purchase-order', async (event, id) => {
  try {
    const [result] = await mysqlPool.query('DELETE FROM purchase_orders WHERE id = ?', [id]);
    return result.affectedRows;
  } catch (err) {
    console.error('Error deleting purchase order (MySQL):', err);
    throw err;
  }
});

// --- STOCK ADJUSTMENTS ---
ipcMain.handle('get-stock-adjustments', async () => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT 
        sa.*, -- includes department, location, custodian from stock_adjustments
        a.id AS asset_db_id,
        a.asset_name AS asset_name_full,
        a.serial_number AS asset_serial_number,
        a.category AS asset_category,
        a.subcategory AS asset_subcategory,
        a.department AS asset_department,
        a.location AS asset_location,
        a.custodian AS asset_custodian,
        a.status AS asset_status,
        a.purchase_cost,
        a.acquisition_date,
        a.date_supplied,
        a.description,
        a.useful_life,
        a.depreciation_method,
        a.annual_depreciation,
        a.accumulated_depreciation,
        a.book_value,
        a.supplier,
        a.supplier_contact_person,
        a.supplier_contact_number,
        a.supplier_email,
        a.supplier_address,
        a.document_number,
        a.remarks AS asset_remarks,
        a.warranty_details,
        a.created_at AS asset_created_at,
        a.updated_at AS asset_updated_at
      FROM stock_adjustments sa
      LEFT JOIN assets a ON sa.asset_id = a.id
      ORDER BY sa.adjustment_date DESC
    `);
    return rows;
  } catch (err) {
    console.error('Error fetching stock adjustments (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-stock-adjustment', async (event, adjustment) => {
  try {
    console.log('Received adjustment data:', adjustment);
    
    if (!adjustment) {
      throw new Error('No adjustment data received');
    }
    
    const { asset_id, adjustment_type, reason, adjustment_date, remarks, created_by } = adjustment;

    // Fetch asset details from assets table
    const [assetRows] = await mysqlPool.query(
      'SELECT asset_name, serial_number, category, subcategory, department, location, custodian FROM assets WHERE id = ?',
      [asset_id]
    );
    const asset = assetRows[0] || {};

    // Validate required fields
    if (!asset_id) {
      throw new Error('Asset ID is required');
    }
    if (!adjustment_type) {
      throw new Error('Adjustment type is required');
    }
    if (!reason) {
      throw new Error('Reason is required');
    }

    // Convert ISO date string to MySQL DATE format (YYYY-MM-DD)
    let formattedDate = null;
    if (adjustment_date) {
      const date = new Date(adjustment_date);
      formattedDate = date.toISOString().split('T')[0];
    } else {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    // Insert all required fields into stock_adjustments
    const [result] = await mysqlPool.query(
      `INSERT INTO stock_adjustments (asset_id, asset_name, serial_number, category, subcategory, department, location, custodian, adjustment_type, reason, adjustment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_id, asset.asset_name || null, asset.serial_number || null, asset.category || null, asset.subcategory || null, asset.department || null, asset.location || null, asset.custodian || null, adjustment_type, reason, formattedDate]
    );

    // If adjustment_type is Lost or Damaged, delete the asset from assets table
    if (["Lost", "Damaged"].includes(adjustment_type)) {
      await mysqlPool.query('DELETE FROM assets WHERE id = ?', [asset_id]);
    } else if (adjustment_type === "Disposal") {
      // Optionally, keep Disposal as status update only
      await mysqlPool.query('UPDATE assets SET status = ? WHERE id = ?', ['Removed', asset_id]);
    }

    console.log('Stock adjustment added successfully with ID:', result.insertId);
    return result.insertId;
  } catch (err) {
    console.error('Error adding stock adjustment (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-stock-adjustment', async (event, id) => {
  try {
    const [result] = await mysqlPool.query('DELETE FROM stock_adjustments WHERE id = ?', [id]);
    return result.affectedRows;
  } catch (err) {
    console.error('Error deleting stock adjustment (MySQL):', err);
    throw err;
  }
});

// --- INVENTORY MOVEMENTS ---
ipcMain.handle('get-inventory-movements', async () => {
  try {
    const [rows] = await mysqlPool.query(`
      SELECT im.*, a.asset_name AS asset_name, a.serial_number AS serial_number
      FROM inventory_movements im
      LEFT JOIN assets a ON im.asset_id = a.id
      ORDER BY im.movement_date DESC
    `);
    return rows;
  } catch (err) {
    console.error('Error fetching inventory movements (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-inventory-movement', async (event, movement) => {
  try {
    console.log('Received movement data:', movement);
    
    if (!movement) {
      throw new Error('No movement data received');
    }
    
    const { asset_id, movement_date, movement_type, from_location, to_location, from_custodian, to_custodian, from_department, to_department, performed_by, remarks } = movement;
    
    const [result] = await mysqlPool.query(
      `INSERT INTO inventory_movements (asset_id, movement_date, movement_type, from_location, to_location, from_custodian, to_custodian, from_department, to_department, performed_by, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_id, movement_date, movement_type, from_location, to_location, from_custodian, to_custodian, from_department, to_department, performed_by, remarks]
    );
    
    // Update asset's custodian to to_custodian (if provided)
    if (asset_id && to_custodian) {
      await mysqlPool.query('UPDATE assets SET custodian = ? WHERE id = ?', [to_custodian, asset_id]);
    }
    
    console.log('Inventory movement added successfully with ID:', result.insertId);
    return result.insertId;
  } catch (err) {
    console.error('Error adding inventory movement (MySQL):', err);
    throw err;
  }
});

// --- ASSET ACQUISITIONS ---
ipcMain.handle('get-asset-acquisitions', async () => {
  try {
    const [rows] = await mysqlPool.query('SELECT * FROM asset_acquisitions ORDER BY acquisition_date DESC');
    return rows;
  } catch (err) {
    console.error('Error fetching asset acquisitions (MySQL):', err);
    return [];
  }
});

ipcMain.handle('add-asset-acquisition', async (event, acquisition) => {
  try {
    const {
  asset_name, category, subcategory, quantity, supplier, acquisition_date, unit_cost, total_cost, document_number, remarks
    } = acquisition;
    
    // Convert ISO date string to MySQL DATE format (YYYY-MM-DD)
    let formattedDate = null;
    if (acquisition_date) {
      const date = new Date(acquisition_date);
      formattedDate = date.toISOString().split('T')[0];
    }
    
  const [result] = await mysqlPool.query(
    `INSERT INTO asset_acquisitions (
  asset_name, category, subcategory, quantity, supplier, acquisition_date, unit_cost, total_cost, document_number, remarks
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
  asset_name, category, subcategory, quantity, supplier, formattedDate, unit_cost, total_cost, document_number, remarks
    ]
  );
    return { id: result.insertId };
  } catch (err) {
    console.error('Error adding asset acquisition (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('update-asset-acquisition', async (event, acquisition) => {
  try {
    const {
  id, asset_name, category, subcategory, quantity, supplier, acquisition_date, unit_cost, total_cost, document_number, remarks
    } = acquisition;
    
    // Convert ISO date string to MySQL DATE format (YYYY-MM-DD)
    let formattedDate = null;
    if (acquisition_date) {
      const date = new Date(acquisition_date);
      formattedDate = date.toISOString().split('T')[0];
    }
    
    const [result] = await mysqlPool.query(
      `UPDATE asset_acquisitions SET
  asset_name = ?, category = ?, subcategory = ?, quantity = ?, supplier = ?, acquisition_date = ?, unit_cost = ?, total_cost = ?, document_number = ?, remarks = ?
      WHERE id = ?`,
      [
  asset_name, category, subcategory, quantity, supplier, formattedDate, unit_cost, total_cost, document_number, remarks, id
      ]
    );
    return { changes: result.affectedRows };
  } catch (err) {
    console.error('Error updating asset acquisition (MySQL):', err);
    throw err;
  }
});

ipcMain.handle('delete-asset-acquisition', async (event, id) => {
  try {
    const [result] = await mysqlPool.query('DELETE FROM asset_acquisitions WHERE id = ?', [id]);
    return { changes: result.affectedRows };
  } catch (err) {
    console.error('Error deleting asset acquisition (MySQL):', err);
    throw err;
  }
});

// --- SETTINGS ---
ipcMain.handle('backup-database', async () => {
  try {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(process.cwd(), `mysql_backup_${timestamp}.sql`);
    
    // Create MySQL dump
    const command = `mysqldump -u root -p inventory_db > "${backupPath}"`;
    await execAsync(command);
    
    return { success: true, path: backupPath };
  } catch (err) {
    console.error('MySQL backup failed:', err);
    throw err;
  }
});

// --- QR CODE ---
ipcMain.handle('save-qr-to-downloads', async (event, { imageData, filename }) => {
  try {
    const { dialog } = require('electron');
    // Show save dialog to user
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save QR Code',
      defaultPath: filename,
      filters: [
        { name: 'PNG Image', extensions: ['png'] }
      ]
    });
    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }
    // Remove data URL prefix
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    await fs.promises.writeFile(filePath, base64Data, 'base64');
    return { success: true, filePath };
  } catch (err) {
    console.error('Failed to save QR code:', err);
    throw err;
  }
}); 

// --- ASSET DETAILS WINDOW ---
ipcMain.handle('open-asset-details', async (event, assetId) => {
  try {
    // Create a new window for asset details
    const assetWindow = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true
      }
    });

    // Load the asset details page
    assetWindow.loadFile('index.html', { hash: `/asset/${assetId}` });
    
    // Set window title
    assetWindow.setTitle(`Asset Details - ID: ${assetId}`);
    
    return { success: true };
  } catch (err) {
    console.error('Failed to open asset details window:', err);
    throw err;
  }
});
// --- SUBCATEGORIES FOR CATEGORY ---
ipcMain.handle('get-subcategories-for-category', async (event, categoryName) => {
  try {
    if (!categoryName) return [];
    const [rows] = await mysqlPool.query(
      'SELECT DISTINCT subcategory FROM assets WHERE category = ? AND subcategory IS NOT NULL AND subcategory != ""',
      [categoryName]
    );
    return rows.map(r => r.subcategory).filter(Boolean);
  } catch (err) {
    console.error('Error fetching subcategories for category (MySQL):', err);
    return [];
  }
});
// --- DEPARTMENT PERSONNEL LIST ---
ipcMain.handle('get-department-personnels', async (event, departmentName) => {
  try {
    if (!departmentName) return [];
    const [rows] = await mysqlPool.query(
      'SELECT DISTINCT custodian FROM assets WHERE department = ? AND custodian IS NOT NULL AND custodian != ""',
      [departmentName]
    );
    return rows.map(r => r.custodian).filter(Boolean);
  } catch (err) {
    console.error('Error fetching personnels for department (MySQL):', err);
    return [];
  }
});

// --- BULK DELETE ASSETS ---
ipcMain.handle('delete-assets-bulk', async (event, assetIds) => {
  try {
    if (!Array.isArray(assetIds) || assetIds.length === 0) return 0;
    // Delete all assets in one query
    const [result] = await mysqlPool.query(
      `DELETE FROM assets WHERE id IN (${assetIds.map(() => '?').join(',')})`,
      assetIds
    );
    // Optionally, log history for each asset (if needed, fetch names first)
    // for (const id of assetIds) {
    //   await logHistory({ user: 'system', action: 'delete', item: 'asset', details: `Bulk deleted asset`, asset_id: id });
    // }
    return result.affectedRows;
  } catch (err) {
    console.error('Error bulk deleting assets (MySQL):', err);
    throw err;
  }
});
// --- BULK DELETE DEPARTMENTS ---
ipcMain.handle('delete-departments-bulk', async (event, departmentNames) => {
  try {
    if (!Array.isArray(departmentNames) || departmentNames.length === 0) return 0;
    const [result] = await mysqlPool.query(
      `DELETE FROM departments WHERE department IN (${departmentNames.map(() => '?').join(',')})`,
      departmentNames
    );
    return result.affectedRows;
  } catch (err) {
    console.error('Error bulk deleting departments (MySQL):', err);
    throw err;
  }
});
// --- BULK DELETE CUSTODIANS ---
ipcMain.handle('delete-custodians-bulk', async (event, custodianIds) => {
  try {
    if (!Array.isArray(custodianIds) || custodianIds.length === 0) return 0;
    const [result] = await mysqlPool.query(
      `DELETE FROM users_and_roles WHERE id IN (${custodianIds.map(() => '?').join(',')})`,
      custodianIds
    );
    return result.affectedRows;
  } catch (err) {
    console.error('Error bulk deleting custodians (MySQL):', err);
    throw err;
  }
});
// --- BULK DELETE CATEGORIES ---
ipcMain.handle('delete-categories-bulk', async (event, categoryIds) => {
  try {
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) return 0;
    const [result] = await mysqlPool.query(
      `DELETE FROM categories WHERE id IN (${categoryIds.map(() => '?').join(',')})`,
      categoryIds
    );
    // Optionally, update assets that used these categories (set to NULL)
    // await mysqlPool.query(`UPDATE assets SET category = NULL WHERE category_id IN (${categoryIds.map(() => '?').join(',')})`, categoryIds);
    return result.affectedRows;
  } catch (err) {
    console.error('Error bulk deleting categories (MySQL):', err);
    throw err;
  }
});