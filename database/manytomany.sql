-- Corrected Shops table
-- The 'shopkeeper_id' column is removed to allow for a many-to-many relationship.
CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Corrected Stores table
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
