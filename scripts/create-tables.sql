-- The following statements update the summary columns in departments and categories tables.
-- Run these statements manually or schedule them as events if triggers are not supported.

-- Update total_assets in departments
UPDATE departments d
SET total_assets = (
  SELECT COUNT(*) FROM assets a WHERE a.department = d.department
);

-- Update assigned_personnel_count in departments
UPDATE departments d
SET assigned_personnel_count = (
  SELECT COUNT(DISTINCT custodian)
  FROM assets a
  WHERE a.department = d.department AND a.custodian IS NOT NULL AND a.custodian != ''
);

-- Update subcategories count in categories
UPDATE categories c
SET subcategories = (
  SELECT COUNT(DISTINCT subcategory)
  FROM assets a
  WHERE a.category = c.category_name AND a.subcategory IS NOT NULL AND a.subcategory != ''
);

-- Update asset_count in categories
UPDATE categories c
SET asset_count = (
  SELECT COUNT(*) FROM assets a WHERE a.category = c.category_name
);

-- Create asset_acquisitions table if it doesn't exist
CREATE TABLE IF NOT EXISTS `asset_acquisitions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `supplier` varchar(255) DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `unit_cost` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(10,2) DEFAULT NULL,
  `document_number` varchar(100) DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_subcategory` (`subcategory`),
  KEY `idx_acquisition_date` (`acquisition_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS `assets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `custodian` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Available',
  `purchase_cost` decimal(10,2) DEFAULT NULL,
  `acquisition_date` date DEFAULT NULL,
  `date_supplied` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `useful_life` int(11) DEFAULT NULL,
  `depreciation_method` varchar(100) DEFAULT NULL,
  `annual_depreciation` decimal(10,2) DEFAULT NULL,
  `accumulated_depreciation` decimal(10,2) DEFAULT NULL,
  `book_value` decimal(10,2) DEFAULT NULL,
  `supplier` varchar(255) DEFAULT NULL,
  `supplier_contact_person` varchar(255) DEFAULT NULL,
  `supplier_contact_number` varchar(100) DEFAULT NULL,
  `supplier_email` varchar(255) DEFAULT NULL,
  `supplier_address` varchar(255) DEFAULT NULL,
  `document_number` varchar(100) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `warranty_details` varchar(255) DEFAULT NULL,
  -- `specs` column removed
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  KEY `idx_subcategory` (`subcategory`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `asset_count` int(11) DEFAULT NULL,
  `subcategories` text DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users_and_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users_and_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_no` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `position_designation` varchar(100) DEFAULT NULL,
  `account_type` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `user_group` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `employment_status` varchar(50) DEFAULT NULL,
  `system_status` varchar(50) DEFAULT NULL,
  `date_registered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department` varchar(100) NOT NULL,
  `description` text,
  `total_assets` int(11) DEFAULT 0,
  `assigned_personnel_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_department` (`department`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create history table if it doesn't exist
CREATE TABLE IF NOT EXISTS `history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text,
  `asset_id` int(11) DEFAULT NULL,
  `asset_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_user` (`user`),
  KEY `idx_action` (`action`),
  KEY `idx_asset_id` (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create inventory_movements table if it doesn't exist
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` int(11) NOT NULL,
  `movement_type` varchar(50) NOT NULL,
  `from_location` varchar(255) DEFAULT NULL,
  `to_location` varchar(255) NOT NULL,
  `from_department` varchar(100) DEFAULT NULL,
  `to_department` varchar(100) DEFAULT NULL,
  `from_custodian` varchar(100) DEFAULT NULL,
  `to_custodian` varchar(100) DEFAULT NULL,
  `movement_date` date NOT NULL,
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_asset_id` (`asset_id`),
  KEY `idx_movement_type` (`movement_type`),
  KEY `idx_movement_date` (`movement_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_no` varchar(50) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `position_designation` varchar(100) DEFAULT NULL,
  `account_type` varchar(50) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `user_group` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `employment_status` varchar(50) DEFAULT NULL,
  `system_status` varchar(50) DEFAULT NULL,
  `date_registered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  -- removed created_at
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create purchase_orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `po_number` varchar(100) NOT NULL,
  `supplier` varchar(255) NOT NULL,
  `order_date` date NOT NULL,
  `delivery_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_po_number` (`po_number`),
  KEY `idx_supplier` (`supplier`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create stock_adjustments table if it doesn't exist
CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` int(11) NOT NULL,
  `asset_name` varchar(255) DEFAULT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `custodian` varchar(255) DEFAULT NULL,
  `adjustment_type` varchar(50) NOT NULL,
  `reason` text,
  `adjustment_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_asset_id` (`asset_id`),
  KEY `idx_adjustment_type` (`adjustment_type`),
  KEY `idx_adjustment_date` (`adjustment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create dashboard_status table if it doesn't exist
CREATE TABLE IF NOT EXISTS `dashboard_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `metric_name` varchar(100) NOT NULL,
  `metric_value` varchar(255) NOT NULL,
  `last_updated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_metric_name` (`metric_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create asset_assignments table if it doesn't exist
CREATE TABLE IF NOT EXISTS `asset_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `asset_id` int(11) NOT NULL,
  `assigned_to` varchar(100) NOT NULL,
  `assignment_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `remarks` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_asset_id` (`asset_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some default categories
INSERT IGNORE INTO `categories` (`name`, `description`) VALUES
('ICT', 'Information and Communication Technology'),
('Office Equipment', 'Office furniture and equipment'),
('Vehicles', 'Company vehicles and transportation'),
('Tools', 'Hand tools and equipment'),
('Electronics', 'Electronic devices and components');

-- Insert some default departments
INSERT IGNORE INTO `departments` (`name`, `description`) VALUES
('IT Department', 'Information Technology Department'),
('HR Department', 'Human Resources Department'),
('Finance Department', 'Finance and Accounting Department'),
('Operations Department', 'Operations and Maintenance Department'),
('Sales Department', 'Sales and Marketing Department'); 