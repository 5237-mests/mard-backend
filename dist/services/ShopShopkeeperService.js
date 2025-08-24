"use strict";
// File: src/services/ShopShopkeeperService.ts
// This service layer handles the business logic for the shop_shopkeepers junction table.
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
exports.ShopShopkeeperService = void 0;
const db_1 = require("../config/db");
class ShopShopkeeperService {
    /**
     * Links a shopkeeper to a specific shop.
     * @param shopId The ID of the shop.
     * @param userId The ID of the user (shopkeeper).
     * @returns An object representing the new link.
     */
    static addShopkeeperToShop(shopId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // First, check if the shop and user exist to maintain foreign key integrity.
            const shopExists = yield (0, db_1.query)("SELECT 1 FROM shops WHERE id = ?", [
                shopId,
            ]);
            if (shopExists.length === 0) {
                throw new Error("Shop not found.");
            }
            const userExists = yield (0, db_1.query)('SELECT 1 FROM users WHERE id = ? AND role = "SHOPKEEPER" OR role = "ADMIN"', [userId]);
            if (userExists.length === 0) {
                throw new Error("User not found or is not a shopkeeper.");
            }
            const sql = `
            INSERT INTO shop_shopkeepers (shop_id, user_id)
            VALUES (?, ?);
        `;
            const params = [shopId, userId];
            try {
                yield (0, db_1.query)(sql, params);
                return { shop_id: shopId, user_id: userId };
            }
            catch (error) {
                console.error("Error adding shopkeeper to shop:", error);
                if (error.code === "ER_DUP_ENTRY") {
                    throw new Error("This shopkeeper is already assigned to this shop.");
                }
                throw new Error("Could not add shopkeeper to shop.");
            }
        });
    }
    /**
     * Unlinks a shopkeeper from a specific shop.
     * @param shopId The ID of the shop.
     * @param userId The ID of the user (shopkeeper).
     * @returns A boolean indicating if the deletion was successful.
     */
    static removeShopkeeperFromShop(shopId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM shop_shopkeepers WHERE shop_id = ? AND user_id = ?";
            const params = [shopId, userId];
            try {
                const result = yield (0, db_1.query)(sql, params);
                // return result.affectedRows > 0;
                return true; // Assume success if no error is thrown
            }
            catch (error) {
                console.error("Error removing shopkeeper from shop:", error);
                throw new Error("Could not remove shopkeeper.");
            }
        });
    }
    /**
     * Retrieves all shopkeepers for a specific shop.
     * @param shopId The ID of the shop.
     * @returns A list of users (shopkeepers) for the shop.
     */
    static getShopkeepersByShopId(shopId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT
                u.id,
                u.name,
                u.email
            FROM users u
            JOIN shop_shopkeepers ssk ON u.id = ssk.user_id
            WHERE ssk.shop_id = ?;
        `;
            try {
                const rows = (0, db_1.query)(sql, [shopId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching shopkeepers for shop:", error);
                throw new Error("Could not retrieve shopkeepers.");
            }
        });
    }
    /**
     * Retrieves all shops for a specific shopkeeper.
     * @param userId The ID of the user (shopkeeper).
     * @returns A list of shops for the shopkeeper.
     */
    static getShopsByShopkeeperId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT
                s.id,
                s.name,
                s.location
            FROM shops s
            JOIN shop_shopkeepers ssk ON s.id = ssk.shop_id
            WHERE ssk.user_id = ?;
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [userId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching shops for shopkeeper:", error);
                throw new Error("Could not retrieve shops.");
            }
        });
    }
}
exports.ShopShopkeeperService = ShopShopkeeperService;
