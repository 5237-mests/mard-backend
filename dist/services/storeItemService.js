"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreItemService = void 0;
// File: src/services/storeItemService.ts
// This service layer handles the many-to-many relationship between stores and items.
const db_1 = require("../config/db");
class StoreItemService {
    /**
     * Adds an item to a specific store with a given quantity.
     * @param storeId The ID of the store.
     * @param itemId The ID of the item.
     * @param quantity The quantity of the item to add.
     * @returns The created link object.
     */
    static addstoreItem(storeId, itemId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, check if the store and item exist to maintain foreign key integrity.
            const storeExists = yield (0, db_1.query)("SELECT 1 FROM stores WHERE id = ?", [
                storeId,
            ]);
            if (storeExists.length === 0) {
                throw new Error("store not found.");
            }
            const itemExists = yield (0, db_1.query)("SELECT 1 FROM items WHERE id = ?", [
                itemId,
            ]);
            if (itemExists.length === 0) {
                throw new Error("Item not found.");
            }
            const sql = `
            INSERT INTO store_items (store_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
            const params = [storeId, itemId, quantity];
            try {
                const result = yield (0, db_1.query)(sql, params);
                return result;
            }
            catch (error) {
                console.error("Error adding/updating store item:", error);
                throw new Error("Could not add item to store.");
            }
        });
    }
    /**
     * Updates the quantity of an existing item in a store.
     * @param storeId The ID of the store.
     * @param itemId The ID of the item.
     * @param newQuantity The new quantity of the item.
     * @returns A boolean indicating if the update was successful.
     */
    static updatestoreItemQuantity(storeId, itemId, newQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "UPDATE store_items SET quantity = ? WHERE store_id = ? AND item_id = ?";
            const params = [newQuantity, storeId, itemId];
            try {
                const result = yield (0, db_1.query)(sql, params);
                // if (result.affectedRows === 0) {
                //   return false;
                // }
                return true;
            }
            catch (error) {
                console.error("Error updating store item quantity:", error);
                throw new Error("Could not update item quantity.");
            }
        });
    }
    /**
     * Deletes an item from a specific store.
     * @param storeId The ID of the store.
     * @param itemId The ID of the item to remove.
     * @returns A boolean indicating if the deletion was successful.
     */
    static deletestoreItem(storeId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM store_items WHERE store_id = ? AND item_id = ?";
            const params = [storeId, itemId];
            try {
                const result = yield (0, db_1.query)(sql, params);
                // return result.affectedRows > 0;
                return true;
            }
            catch (error) {
                console.error("Error deleting store item:", error);
                throw new Error("Could not delete item from store.");
            }
        });
    }
    /**
     * Retrieves all items available in a specific store.
     * @param storeId The ID of the store.
     * @returns A list of items in the store.
     */
    static getItemsBystoreId(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS id,
                i.code AS code,
                i.name AS name,
                i.model AS model,
                c.name AS category,
                b.name AS brand,
                i.image,
                i.price AS price,
                i.minimum_stock
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            JOIN categories c ON i.category_id = c.id
            JOIN brands b ON i.brand_id = b.id
            WHERE si.store_id = ?
            ORDER BY i.name ASC
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [storeId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for store:", error);
                throw new Error("Could not fetch items for the store.");
            }
        });
    }
    //   list all item in all store
    static getAllItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.code AS item_code,
                i.model AS item_model,
                i.price AS item_price
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            ORDER BY i.name ASC
        `;
            try {
                const rows = yield (0, db_1.query)(sql);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for store:", error);
                throw new Error("Could not fetch items for the store.");
            }
        });
    }
    // get item by id in all store
    static getItemByItemId(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.code AS item_code,
                i.model AS item_model,
                i.price AS item_price
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            WHERE i.id = ?
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [itemId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for store:", error);
                throw new Error("Could not fetch items for the store.");
            }
        });
    }
    // getItemsBystoreIdAndItemId
    static getItemsBystoreIdAndItemId(storeId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.code AS item_code,
                i.model AS item_model,
                i.price AS item_price
            FROM store_items si
            JOIN items i ON si.item_id = i.id
            WHERE si.store_id = ? AND si.item_id = ?
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [storeId, itemId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for store:", error);
                throw new Error("Could not fetch items for the store.");
            }
        });
    }
    // Add multiple items to a store
    static addMultiplestoreItems(storeId, items) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!items || items.length === 0) {
                return;
            }
            // Validate store exists
            const storeExists = yield (0, db_1.query)("SELECT 1 FROM stores WHERE id = ?", [
                storeId,
            ]);
            if (storeExists.length === 0) {
                throw new Error("store not found.");
            }
            // Validate item ids exist
            const itemIds = Array.from(new Set(items.map((it) => it.itemId)));
            const placeholders = itemIds.map(() => "?").join(",");
            const existingRows = yield (0, db_1.query)(`SELECT id FROM items WHERE id IN (${placeholders})`, itemIds);
            const existingIds = new Set(existingRows.map((r) => r.id));
            const missing = itemIds.filter((id) => !existingIds.has(id));
            if (missing.length > 0) {
                throw new Error(`Items not found: ${missing.join(", ")}`);
            }
            // Build single bulk insert with ON DUPLICATE KEY UPDATE
            const valuePlaceholders = items.map(() => "(?, ?, ?)").join(", ");
            const sql = `
            INSERT INTO store_items (store_id, item_id, quantity)
            VALUES ${valuePlaceholders}
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
            const params = [];
            for (const it of items) {
                params.push(storeId, it.itemId, it.quantity);
            }
            try {
                yield (0, db_1.query)(sql, params);
            }
            catch (error) {
                console.error("Error adding multiple store items:", error);
                throw new Error("Could not add multiple items to store.");
            }
        });
    }
}
exports.StoreItemService = StoreItemService;
