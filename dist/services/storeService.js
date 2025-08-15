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
exports.StoreService = void 0;
const db_1 = require("../config/db");
class StoreService {
    /**
     * Creates a new store in the database.
     * @param name The name of the store.
     * @param location The location of the store.
     * @returns The newly created store object.
     */
    static createStore(name, location) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "INSERT INTO stores (name, location) VALUES (?, ?)";
            const params = [name, location];
            try {
                const result = yield (0, db_1.query)(sql, params);
                return result;
            }
            catch (error) {
                console.error("Error creating store:", error);
                throw new Error("Could not create store.");
            }
        });
    }
    /**
     * Retrieves all stores from the database.
     * @returns A list of all stores.
     */
    static getStores() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM stores";
            try {
                const rows = yield (0, db_1.query)(sql);
                return rows;
            }
            catch (error) {
                console.error("Error fetching stores:", error);
                throw new Error("Could not fetch stores.");
            }
        });
    }
    /**
     * Retrieves a single store by its ID.
     * @param id The ID of the store to retrieve.
     * @returns The store object or null if not found.
     */
    static getStoreById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM stores WHERE id = ?";
            try {
                const rows = yield (0, db_1.query)(sql, [id]);
                if (rows.length === 0) {
                    return [];
                }
                return rows;
            }
            catch (error) {
                console.error("Error fetching store by ID:", error);
                throw new Error("Could not fetch store.");
            }
        });
    }
    /**
     * Updates an existing store.
     * @param id The ID of the store to update.
     * @param name The new name of the store (optional).
     * @param location The new location of the store (optional).
     * @returns The updated store object or null if the store was not found.
     */
    static updateStore(id, name, location) {
        return __awaiter(this, void 0, void 0, function* () {
            const updates = [];
            const params = [];
            if (name !== undefined) {
                updates.push("name = ?");
                params.push(name);
            }
            if (location !== undefined) {
                updates.push("location = ?");
                params.push(location);
            }
            if (updates.length === 0) {
                throw new Error("No fields provided to update.");
            }
            const sql = `UPDATE stores SET ${updates.join(", ")} WHERE id = ?`;
            params.push(id);
            try {
                const result = yield (0, db_1.query)(sql, params);
                if (result.affectedRows === 0) {
                    return [];
                }
                return this.getStoreById(id);
            }
            catch (error) {
                console.error("Error updating store:", error);
                throw new Error("Could not update store.");
            }
        });
    }
    /**
     * Deletes a store by its ID.
     * @param id The ID of the store to delete.
     * @returns A boolean indicating if the deletion was successful.
     */
    static deleteStore(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM stores WHERE id = ?";
            try {
                const result = yield (0, db_1.query)(sql, [id]);
                return result.affectedRows > 0;
            }
            catch (error) {
                console.error("Error deleting store:", error);
                throw new Error("Could not delete store.");
            }
        });
    }
}
exports.StoreService = StoreService;
