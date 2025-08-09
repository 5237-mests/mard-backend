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
    model VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    brand_id INT,
    category_id INT DEFAULT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Shops table
-- Renamed shopkeeperId to shopkeeper_id for consistency.
CREATE TABLE IF NOT EXISTS shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  shopkeeper_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Stores table
-- Renamed storekeeperId to storekeeper_id for consistency.
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  storekeeper_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storekeeper_id) REFERENCES users(id) ON DELETE SET NULL
);

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
-- The 'items' JSON column has been removed.
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shop_id INT NOT NULL,
  sold_by_id INT NOT NULL,
  sold_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (sold_by_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sale items junction table
-- This table replaces the sales.items JSON column for data integrity.
CREATE TABLE IF NOT EXISTS sale_items (
  sale_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  PRIMARY KEY (sale_id, item_id),
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Transfer requests table
-- The 'items' JSON column has been removed.
-- Renamed columns to from_store_id and to_store_id for clarity.
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
CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_shops_shopkeeper ON shops(shopkeeper_id);
CREATE INDEX idx_stores_storekeeper ON stores(storekeeper_id);
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
