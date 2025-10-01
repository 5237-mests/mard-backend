-- Database schema for MARD (Multi-role Access Resource Dashboard)
-- Optimized for data integrity and consistency.

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS marddb;
USE marddb;

-- Users table
-- The 'role' column directly uses the ENUM type.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(1024) NOT NULL,
  role ENUM('ADMIN', 'SHOPKEEPER', 'STOREKEEPER', 'USER') DEFAULT 'USER',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Creating the brands table
CREATE TABLE brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating the categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    model VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    brand_id INT,
    category_id INT DEFAULT NULL,
    minimum_stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

-- Shops table
-- The 'shopkeeper_id' column is removed to correctly model a many-to-many relationship.
CREATE TABLE IF NOT EXISTS shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Stores table
-- The 'storekeeper_id' column is removed for the same reason.
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- New Junction Table for Shops and Shopkeepers
-- This table correctly models the many-to-many relationship.
CREATE TABLE IF NOT EXISTS shop_shopkeepers (
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (shop_id, user_id),
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- New Junction Table for Stores and Storekeepers
-- This table models the many-to-many relationship for stores.
CREATE TABLE IF NOT EXISTS store_storekeepers (
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    PRIMARY KEY (store_id, user_id),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY unique_shop_item (shop_id, item_id)
);

-- Store items table
CREATE TABLE IF NOT EXISTS store_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY unique_store_item (store_id, item_id)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  sold_by_id INT NOT NULL,
  total_amount INT NOT NULL,
  customer_name VARCHAR(255),
  customer_contact VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (sold_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  price INT NOT NULL,
  item_serial_number VARCHAR(255),
  PRIMARY KEY (sale_id, item_id),
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Transfer requests table
CREATE TABLE IF NOT EXISTS transfer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_store_id INT NOT NULL,
  to_store_id INT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  requested_by_id INT NOT NULL,
  approved_by_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (from_store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (to_store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Transfer request items junction table
-- This table replaces the transfer_requests.items JSON column.
CREATE TABLE IF NOT EXISTS transfer_request_items (
  request_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (request_id, item_id),
  FOREIGN KEY (request_id) REFERENCES transfer_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Notifications table
-- Removed the redundant 'createdAt' column.
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_items_brand_id ON items(brand_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_items_model ON items(model);
-- These indexes are removed as they are no longer relevant in the corrected schema
-- CREATE INDEX idx_shops_shopkeeper ON shops(shopkeeper_id);
-- CREATE INDEX idx_stores_storekeeper ON stores(storekeeper_id);
-- The new junction tables will have their own composite primary key indexes
CREATE INDEX idx_shop_items_shop ON shop_items(shop_id);
CREATE INDEX idx_shop_items_item ON shop_items(item_id);
CREATE INDEX idx_store_items_store ON store_items(store_id);
CREATE INDEX idx_store_items_item ON store_items(item_id);
CREATE INDEX idx_sales_shop ON sales(shop_id);
CREATE INDEX idx_sales_sold_by ON sales(sold_by_id);
CREATE INDEX idx_sales_sold_at ON sales(sold_at);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_item ON sale_items(item_id);
CREATE INDEX idx_transfer_requests_from ON transfer_requests(from_store_id);
CREATE INDEX idx_transfer_requests_to ON transfer_requests(to_store_id);
CREATE INDEX idx_transfer_requests_requested_by ON transfer_requests(requested_by_id);
CREATE INDEX idx_transfer_requests_approved_by ON transfer_requests(approved_by_id);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX idx_transfer_request_items_request ON transfer_request_items(request_id);
CREATE INDEX idx_transfer_request_items_item ON transfer_request_items(item_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);



-- First, drop the foreign key constraint that references the column.
-- The constraint name is often in the format 'table_name_ibfk_1' but can vary.
-- You can find the exact name by using the following query:
-- SHOW CREATE TABLE shops;
-- ALTER TABLE shops DROP FOREIGN KEY shops_ibfk_1;

-- Now that the constraint is removed, you can safely drop the column.
-- ALTER TABLE shops DROP COLUMN shopkeeper_id;
