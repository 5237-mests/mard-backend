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
exports.ShopItemService = void 0;
// File: src/services/ShopItemService.ts
// This service layer handles the many-to-many relationship between shops and items.
const db_1 = require("../config/db");
class ShopItemService {
    /**
     * Adds an item to a specific shop with a given quantity.
     * @param shopId The ID of the shop.
     * @param itemId The ID of the item.
     * @param quantity The quantity of the item to add.
     * @returns The created link object.
     */
    static addShopItem(shopId, itemId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, check if the shop and item exist to maintain foreign key integrity.
            const shopExists = yield (0, db_1.query)("SELECT 1 FROM shops WHERE id = ?", [
                shopId,
            ]);
            if (shopExists.length === 0) {
                throw new Error("Shop not found.");
            }
            const itemExists = yield (0, db_1.query)("SELECT 1 FROM items WHERE id = ?", [
                itemId,
            ]);
            if (itemExists.length === 0) {
                throw new Error("Item not found.");
            }
            const sql = `
            INSERT INTO shop_items (shop_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `;
            const params = [shopId, itemId, quantity];
            try {
                const result = yield (0, db_1.query)(sql, params);
                return result;
            }
            catch (error) {
                console.error("Error adding/updating shop item:", error);
                throw new Error("Could not add item to shop.");
            }
        });
    }
    /**
     * Updates the quantity of an existing item in a shop.
     * @param shopId The ID of the shop.
     * @param itemId The ID of the item.
     * @param newQuantity The new quantity of the item.
     * @returns A boolean indicating if the update was successful.
     */
    static updateShopItemQuantity(shopId, itemId, newQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "UPDATE shop_items SET quantity = ? WHERE shop_id = ? AND item_id = ?";
            const params = [newQuantity, shopId, itemId];
            try {
                const result = yield (0, db_1.query)(sql, params);
                // if (result.affectedRows === 0) {
                //   return false;
                // }
                return true;
            }
            catch (error) {
                console.error("Error updating shop item quantity:", error);
                throw new Error("Could not update item quantity.");
            }
        });
    }
    /**
     * Deletes an item from a specific shop.
     * @param shopId The ID of the shop.
     * @param itemId The ID of the item to remove.
     * @returns A boolean indicating if the deletion was successful.
     */
    static deleteShopItem(shopId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM shop_items WHERE shop_id = ? AND item_id = ?";
            const params = [shopId, itemId];
            try {
                const result = yield (0, db_1.query)(sql, params);
                // return result.affectedRows > 0;
                return true;
            }
            catch (error) {
                console.error("Error deleting shop item:", error);
                throw new Error("Could not delete item from shop.");
            }
        });
    }
    /**
     * Retrieves all items available in a specific shop.
     * @param shopId The ID of the shop.
     * @returns A list of items in the shop.
     */
    static getItemsByShopId(shopId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS id,
                i.name AS name,
                i.model AS model,
                c.name AS category,
                b.name AS brand,
                i.price AS price,
                i.minimum_stock
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            JOIN categories c ON i.category_id = c.id
            JOIN brands b ON i.brand_id = b.id
            WHERE si.shop_id = ?
            ORDER BY i.name ASC
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [shopId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for shop:", error);
                throw new Error("Could not fetch items for the shop.");
            }
        });
    }
    //   list all item in all shop
    static getAllItems() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.model AS item_model,
                i.price AS item_price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            ORDER BY i.name ASC
        `;
            try {
                const rows = yield (0, db_1.query)(sql);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for shop:", error);
                throw new Error("Could not fetch items for the shop.");
            }
        });
    }
    // get item by id in all shop
    static getItemByItemId(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.model AS item_model,
                i.price AS item_price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            WHERE i.id = ?
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [itemId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for shop:", error);
                throw new Error("Could not fetch items for the shop.");
            }
        });
    }
    // getItemsByShopIdAndItemId
    static getItemsByShopIdAndItemId(shopId, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT 
                si.quantity,
                i.id AS item_id,
                i.name AS item_name,
                i.model AS item_model,
                i.price AS item_price
            FROM shop_items si
            JOIN items i ON si.item_id = i.id
            WHERE si.shop_id = ? AND si.item_id = ?
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [shopId, itemId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for shop:", error);
                throw new Error("Could not fetch items for the shop.");
            }
        });
    }
}
exports.ShopItemService = ShopItemService;
