CREATE TABLE item_transfers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reference       VARCHAR(50) UNIQUE NOT NULL,

  from_type       ENUM('store', 'shop') NOT NULL,
  from_store_id   INT DEFAULT NULL,
  from_shop_id    INT DEFAULT NULL,

  to_type         ENUM('store', 'shop') NOT NULL,
  to_store_id     INT DEFAULT NULL,
  to_shop_id      INT DEFAULT NULL,

  status          ENUM('pending', 'completed', 'canceled') DEFAULT 'pending',
  notes           TEXT,
  created_by_id   INT NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_transfer_user FOREIGN KEY (created_by_id)
    REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_from_store FOREIGN KEY (from_store_id)
    REFERENCES stores(id) ON DELETE SET NULL,

  CONSTRAINT fk_from_shop FOREIGN KEY (from_shop_id)
    REFERENCES shops(id) ON DELETE SET NULL,

  CONSTRAINT fk_to_store FOREIGN KEY (to_store_id)
    REFERENCES stores(id) ON DELETE SET NULL,

  CONSTRAINT fk_to_shop FOREIGN KEY (to_shop_id)
    REFERENCES shops(id) ON DELETE SET NULL
);

CREATE TABLE transfer_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  transfer_id    INT NOT NULL,
  item_id     INT NOT NULL,
  quantity       INT NOT NULL CHECK (quantity > 0),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_transfer FOREIGN KEY (transfer_id)
    REFERENCES item_transfers(id) ON DELETE CASCADE,

  CONSTRAINT fk_transfer_product FOREIGN KEY (item_id)
    REFERENCES items(id) ON DELETE CASCADE
);



CREATE TABLE transfers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  reference       VARCHAR(50) default NULL,

  from_type       ENUM('store', 'shop') NOT NULL,
  from_store_id   INT DEFAULT NULL,
  from_shop_id    INT DEFAULT NULL,

  to_type         ENUM('store', 'shop') NOT NULL,
  to_store_id     INT DEFAULT NULL,
  to_shop_id      INT DEFAULT NULL,

  status          ENUM('pending', 'completed', 'canceled') DEFAULT 'pending',
  notes           TEXT,
  created_by_id   INT NOT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_transfer_user FOREIGN KEY (created_by_id)
    REFERENCES users(id) ON DELETE CASCADE,

  CONSTRAINT fk_from_store FOREIGN KEY (from_store_id)
    REFERENCES stores(id) ON DELETE SET NULL,

  CONSTRAINT fk_from_shop FOREIGN KEY (from_shop_id)
    REFERENCES shops(id) ON DELETE SET NULL,

  CONSTRAINT fk_to_store FOREIGN KEY (to_store_id)
    REFERENCES stores(id) ON DELETE SET NULL,

  CONSTRAINT fk_to_shop FOREIGN KEY (to_shop_id)
    REFERENCES shops(id) ON DELETE SET NULL
);

CREATE TABLE transfer_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  transfer_id    INT NOT NULL,
  item_id        INT NOT NULL,
  quantity       INT NOT NULL CHECK (quantity > 0),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_transfer FOREIGN KEY (transfer_id)
    REFERENCES transfers(id) ON DELETE CASCADE,

  CONSTRAINT fk_transfer_product FOREIGN KEY (item_id)
    REFERENCES items(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS deadstock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_id INT NOT NULL,
  source_type ENUM('store','shop') NOT NULL,
  source_store_id INT DEFAULT NULL,
  source_shop_id INT DEFAULT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  status ENUM('pending','resolved','discarded') DEFAULT 'pending',
  created_by_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,

  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (source_store_id) REFERENCES stores(id),
  FOREIGN KEY (source_shop_id) REFERENCES shops(id),
  FOREIGN KEY (created_by_id) REFERENCES users(id),

  INDEX idx_deadstock_status (status),
  INDEX idx_deadstock_source_type (source_type),
  INDEX idx_deadstock_item_id (item_id),
  INDEX idx_deadstock_created_by (created_by_id),
  INDEX idx_deadstock_created_at (created_at),

  CHECK (
    (source_type = 'store' AND source_store_id IS NOT NULL AND source_shop_id IS NULL)
    OR
    (source_type = 'shop' AND source_shop_id IS NOT NULL AND source_store_id IS NULL)
  )
);


CREATE TABLE IF NOT EXISTS store_receives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  reference_no VARCHAR(50) DEFAULT NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_by_id INT NOT NULL,
  approved_by_id INT DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME DEFAULT NULL,

  CONSTRAINT fk_store_receives_store FOREIGN KEY (store_id) REFERENCES stores(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_store_receives_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_store_receives_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,

  INDEX idx_receive_status (status),
  INDEX idx_receive_store (store_id),
  INDEX idx_receive_created_by (created_by_id),
  INDEX idx_receive_created_at (created_at)
) 

CREATE TABLE IF NOT EXISTS store_receive_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receive_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL,
  cost_price INT DEFAULT NULL,
  note VARCHAR(255) DEFAULT NULL,

  CONSTRAINT fk_receive_items_receive FOREIGN KEY (receive_id) REFERENCES store_receives(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_receive_items_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE ON DELETE RESTRICT,

  INDEX idx_receive_items_receive (receive_id),
  INDEX idx_receive_items_item (item_id),

  CHECK (quantity > 0)
)