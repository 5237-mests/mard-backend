"use strict";
// File: src/services/storestorekeeperService.ts
// This service layer handles the business logic for the store_storekeepers junction table.
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
exports.StoreStorekeeperService = void 0;
const db_1 = require("../config/db");
class StoreStorekeeperService {
    /**
     * Links a storekeeper to a specific store.
     * @param storeId The ID of the store.
     * @param userId The ID of the user (storekeeper).
     * @returns An object representing the new link.
     */
    static addStorekeeperTostore(storeId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, check if the store and user exist to maintain foreign key integrity.
            const storeExists = yield (0, db_1.query)("SELECT 1 FROM stores WHERE id = ?", [
                storeId,
            ]);
            if (storeExists.length === 0) {
                throw new Error("store not found.");
            }
            const userExists = yield (0, db_1.query)('SELECT 1 FROM users WHERE id = ? AND role = "storeKEEPER" OR role = "ADMIN"', [userId]);
            if (userExists.length === 0) {
                throw new Error("User not found or is not a storekeeper.");
            }
            const sql = `
            INSERT INTO store_storekeepers (store_id, user_id)
            VALUES (?, ?);
        `;
            const params = [storeId, userId];
            try {
                yield (0, db_1.query)(sql, params);
                return { store_id: storeId, user_id: userId };
            }
            catch (error) {
                console.error("Error adding storekeeper to store:", error);
                if (error.code === "ER_DUP_ENTRY") {
                    throw new Error("This storekeeper is already assigned to this store.");
                }
                throw new Error("Could not add storekeeper to store.");
            }
        });
    }
    /**
     * Unlinks a storekeeper from a specific store.
     * @param storeId The ID of the store.
     * @param userId The ID of the user (storekeeper).
     * @returns A boolean indicating if the deletion was successful.
     */
    static removeStorekeeperFromstore(storeId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM store_storekeepers WHERE store_id = ? AND user_id = ?";
            const params = [storeId, userId];
            try {
                const result = yield (0, db_1.query)(sql, params);
                // return result.affectedRows > 0;
                return true; // Assume success if no error is thrown
            }
            catch (error) {
                console.error("Error removing storekeeper from store:", error);
                throw new Error("Could not remove storekeeper.");
            }
        });
    }
    /**
     * Retrieves all storekeepers for a specific store.
     * @param storeId The ID of the store.
     * @returns A list of users (storekeepers) for the store.
     */
    static getStorekeepersByStoreId(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT
                u.id,
                u.name,
                u.email
            FROM users u
            JOIN store_storekeepers ssk ON u.id = ssk.user_id
            WHERE ssk.store_id = ?;
        `;
            try {
                const rows = (0, db_1.query)(sql, [storeId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching storekeepers for store:", error);
                throw new Error("Could not retrieve storekeepers.");
            }
        });
    }
    /**
     * Retrieves all stores for a specific storekeeper.
     * @param userId The ID of the user (storekeeper).
     * @returns A list of stores for the storekeeper.
     */
    static getStoresByStorekeeperId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT
                s.id,
                s.name,
                s.location
            FROM stores s
            JOIN store_storekeepers ssk ON s.id = ssk.store_id
            WHERE ssk.user_id = ?;
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [userId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching stores for storekeeper:", error);
                throw new Error("Could not retrieve stores.");
            }
        });
    }
}
exports.StoreStorekeeperService = StoreStorekeeperService;
