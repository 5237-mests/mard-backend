-- Database schema for MARD (Multi-role Access Resource Dashboard)
-- Based on Prisma schema conversion to raw SQL

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS marddb;
USE marddb;

-- Create role enum
CREATE TABLE IF NOT EXISTS role (
  value ENUM('ADMIN', 'SHOPKEEPER', 'STOREKEEPER', 'USER') PRIMARY KEY
);

-- Create transfer_request_status enum
CREATE TABLE IF NOT EXISTS transfer_request_status (
  value ENUM('PENDING', 'APPROVED', 'REJECTED') PRIMARY KEY
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(1024) NOT NULL,
  role ENUM('ADMIN', 'SHOPKEEPER', 'STOREKEEPER', 'USER') DEFAULT 'USER',
  isVerified BOOLEAN DEFAULT FALSE,
  verificationToken VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) UNIQUE NOT NULL,
  unit VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  shopkeeperId INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopkeeperId) REFERENCES users(id) ON DELETE SET NULL
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  storekeeperId INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storekeeperId) REFERENCES users(id) ON DELETE SET NULL
);

-- Shop items table
CREATE TABLE IF NOT EXISTS shop_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shopId INT NOT NULL,
  itemId INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY unique_shop_item (shopId, itemId)
);

-- Store items table
CREATE TABLE IF NOT EXISTS store_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storeId INT NOT NULL,
  itemId INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storeId) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (itemId) REFERENCES items(id) ON DELETE CASCADE,
  UNIQUE KEY unique_store_item (storeId, itemId)
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shopId INT NOT NULL,
  items JSON NOT NULL,
  soldById INT NOT NULL,
  soldAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES shops(id) ON DELETE CASCADE,
  FOREIGN KEY (soldById) REFERENCES users(id) ON DELETE CASCADE
);

-- Transfer requests table
CREATE TABLE IF NOT EXISTS transfer_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `from` INT NOT NULL,
  `to` INT NOT NULL,
  items JSON NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  requestedById INT NOT NULL,
  approvedById INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requestedById) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedById) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  message TEXT NOT NULL,
  `read` BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_items_code ON items(code);
CREATE INDEX idx_shops_shopkeeper ON shops(shopkeeperId);
CREATE INDEX idx_stores_storekeeper ON stores(storekeeperId);
CREATE INDEX idx_shop_items_shop ON shop_items(shopId);
CREATE INDEX idx_shop_items_item ON shop_items(itemId);
CREATE INDEX idx_store_items_store ON store_items(storeId);
CREATE INDEX idx_store_items_item ON store_items(itemId);
CREATE INDEX idx_sales_shop ON sales(shopId);
CREATE INDEX idx_sales_sold_by ON sales(soldById);
CREATE INDEX idx_sales_sold_at ON sales(soldAt);
CREATE INDEX idx_transfer_requests_from ON transfer_requests(`from`);
CREATE INDEX idx_transfer_requests_to ON transfer_requests(`to`);
CREATE INDEX idx_transfer_requests_requested_by ON transfer_requests(requestedById);
CREATE INDEX idx_transfer_requests_approved_by ON transfer_requests(approvedById);
CREATE INDEX idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX idx_notifications_user ON notifications(userId);
CREATE INDEX idx_notifications_read ON notifications(`read`);
CREATE INDEX idx_notifications_created_at ON notifications(createdAt);