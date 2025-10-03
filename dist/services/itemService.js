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
exports.ItemService = void 0;
const db_1 = require("../config/db");
class ItemService {
    /**
     * Retrieves all items from the database.
     * @returns {Promise<Item[]>} A promise that resolves to an array of all items.
     */
    getAllItems() {
        return __awaiter(this, void 0, void 0, function* () {
            // join brands and categories to get more details
            const sql = `SELECT items.*, brands.name AS brand_name, categories.name AS category_name
                 FROM items
                 JOIN brands ON items.brand_id = brands.id
                 JOIN categories ON items.category_id = categories.id
                 ORDER BY items.name ASC`;
            const result = yield (0, db_1.query)(sql);
            return result;
        });
    }
    /**
     * Retrieves an item by its ID from the database.
     * @param id - The ID of the item to retrieve.
     * @returns {Promise<Item | null>} A promise that resolves to the item object if found, otherwise null.
     */
    getItemById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `SELECT * FROM items WHERE id = ?`;
            const result = yield (0, db_1.query)(sql, [id]);
            return result;
        });
    }
    /**
     * Creates a new item in the database.
     * @param item - The item object containing the details to create.
     * @returns {Promise<Item>} A promise that resolves to the newly created item object.
     */
    createItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if item exists by name.
            const checkSql = `SELECT * FROM items WHERE name = ?`;
            const existingItems = yield (0, db_1.query)(checkSql, [item.name]);
            if (existingItems.length > 0) {
                return null;
            }
            const sql = `
      INSERT INTO items (name, code, description, model, price, brand_id, category_id, minimum_stock, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
            const params = [
                item.name,
                item.code || null,
                item.description || null,
                item.model,
                item.price,
                item.brand_id,
                item.category_id || null,
                item.minimum_stock || 0,
                item.image || null,
            ];
            const result = yield (0, db_1.query)(sql, params);
            // Return the inserted item (you might want to fetch it fully)
            return result;
        });
    }
    /**
     * Updates an item in the database.
     * @param id - The ID of the item to update.
     * @param itemData - The item object containing the details to update.
     * @returns {Promise<Item | null>} A promise that resolves to the item object if found and updated, otherwise null.
     */
    updateItem01(id, itemData) {
        return __awaiter(this, void 0, void 0, function* () {
            const setValues = Object.entries(itemData)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `${key} = ?`)
                .join(", ");
            const updateSql = `UPDATE items SET ${setValues} WHERE id = ?`;
            const result = yield (0, db_1.query)(updateSql, [...Object.values(itemData), id]);
            return result;
        });
    }
    updateItem(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            const fields = [];
            const params = [];
            if (item.name !== undefined) {
                fields.push("name = ?");
                params.push(item.name);
            }
            if (item.code !== undefined) {
                fields.push("code = ?");
                params.push(item.code);
            }
            if (item.description !== undefined) {
                fields.push("description = ?");
                params.push(item.description);
            }
            if (item.model !== undefined) {
                fields.push("model = ?");
                params.push(item.model);
            }
            if (item.price !== undefined) {
                fields.push("price = ?");
                params.push(item.price);
            }
            if (item.brand_id !== undefined) {
                fields.push("brand_id = ?");
                params.push(item.brand_id);
            }
            if (item.category_id !== undefined) {
                fields.push("category_id = ?");
                params.push(item.category_id);
            }
            if (item.minimum_stock !== undefined) {
                fields.push("minimum_stock = ?");
                params.push(item.minimum_stock);
            }
            if (item.image !== undefined) {
                fields.push("image = ?");
                params.push(item.image);
            }
            if (fields.length === 0)
                return true; // Nothing to update
            const sql = `UPDATE items SET ${fields.join(", ")} WHERE id = ?`;
            params.push(id);
            const result = yield (0, db_1.query)(sql, params);
            return result;
        });
    }
    /**
     * Deletes an item from the database.
     * @param id - The ID of the item to delete.
     * @returns {Promise<void>} A promise that resolves when the item is deleted.
     */
    deleteItem(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `DELETE FROM items WHERE id = ?`;
            yield (0, db_1.query)(sql, [id]);
        });
    }
}
exports.ItemService = ItemService;
