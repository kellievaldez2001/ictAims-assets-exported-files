# Database Setup Scripts

This directory contains scripts to fix the database issue with the `asset_acquisitions` table missing the `subcategory` column.

## Quick Fix (Recommended)

Use the simple fix script to just add the missing column:

```bash
cd scripts
node fix-asset-acquisitions.js
```

This script will:
1. Connect to your MySQL database
2. Check if the `asset_acquisitions` table exists
3. If it doesn't exist, create it with all required columns
4. If it exists but is missing `subcategory`, add that column
5. Verify the final table structure

## Full Database Setup

If you want to set up the entire database from scratch:

```bash
cd scripts
node setup-database.js
```

This script will:
1. Create the `inventory_db` database if it doesn't exist
2. Create all required tables with proper structure
3. Insert default categories and departments
4. Set up proper indexes and constraints

## Prerequisites

1. **MySQL must be running:**
   ```bash
   sudo mysql.server start
   ```

2. **MySQL root access:**
   - If you have a password for root user, update the `password` field in the script
   - If no password, leave it as empty string `''`

3. **Node.js dependencies:**
   ```bash
   npm install mysql2
   ```

## Configuration

Update the database connection settings in the scripts if needed:

```javascript
const dbConfig = {
  host: 'localhost',        // Change if MySQL is on different host
  user: 'root',            // Change if using different user
  password: '',            // Add your MySQL password here
  port: 3306,              // Change if using different port
  database: 'inventory_db' // Change if using different database name
};
```

## Troubleshooting

### Connection Refused
- MySQL service is not running
- Run: `sudo mysql.server start`

### Access Denied
- Wrong username/password
- Update the credentials in the script

### Database Doesn't Exist
- Create it manually: `CREATE DATABASE inventory_db;`
- Or use the full setup script

## What Gets Fixed

The main issue was:
- **Error:** `Unknown column 'subcategory' in 'field list'`
- **Cause:** The `asset_acquisitions` table was missing the `subcategory` column
- **Solution:** Add the missing column or recreate the table with proper structure

After running the fix script, your `asset_acquisitions` table will have:
- `id` (auto-increment primary key)
- `asset_name` (required)
- `category` (required)
- `subcategory` (nullable)
- `quantity` (default: 1)
- `supplier` (nullable)
- `acquisition_date` (nullable)
- `unit_cost` (nullable)
- `total_cost` (nullable)
- `document_number` (nullable)
- `location` (nullable)
- `remarks` (nullable)
- `created_at` (auto-timestamp)
- `updated_at` (auto-updating timestamp) 