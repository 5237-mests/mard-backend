
CREATE TABLE IF NOT EXISTS item_requests (
  id INT  NOT NULL AUTO_INCREMENT,
  reference VARCHAR(191) DEFAULT NULL,
  shop_id INT  NOT NULL,        -- request originates from shop
  store_id INT  NOT NULL,       -- destination store
  status ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  created_by_id INT  DEFAULT NULL,
  approved_by_id INT  DEFAULT NULL,
  transfer_id INT  DEFAULT NULL, -- link to transfer when approved
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_item_requests_shop (shop_id),
  KEY idx_item_requests_store (store_id),
  KEY idx_item_requests_status (status),
  CONSTRAINT fk_item_requests_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_requests_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_requests_created_by FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_item_requests_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS item_request_items (
  id INT  NOT NULL AUTO_INCREMENT,
  request_id INT  NOT NULL,
  item_id INT  NOT NULL,
  quantity INT NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_req_items_request (request_id),
  KEY idx_req_items_item (item_id),
  CONSTRAINT fk_req_items_request FOREIGN KEY (request_id) REFERENCES item_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_req_items_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE RESTRICT
);