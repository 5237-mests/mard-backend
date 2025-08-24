"use strict";
// File: src/services/ShopkeeperItemService.ts
// This service handles queries that link a shopkeeper to their items.
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
exports.ShopkeeperItemService = void 0;
const db_1 = require("../config/db");
// Placeholder for database connection
class ShopkeeperItemService {
    /**
     * Retrieves all items managed by a specific shopkeeper.
     * @param userId The ID of the shopkeeper.
     * @returns A list of items associated with the shopkeeper's shops.
     */
    static getItemsByShopkeeperId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
            SELECT
                i.id,
                i.name,
                i.model,
                si.quantity,
                s.name AS shop_name
            FROM users u
            JOIN shop_shopkeepers ssk ON u.id = ssk.user_id
            JOIN shops s ON ssk.shop_id = s.id
            JOIN shop_items si ON s.id = si.shop_id
            JOIN items i ON si.item_id = i.id
            WHERE u.id = ?;
        `;
            try {
                const rows = yield (0, db_1.query)(sql, [userId]);
                return rows;
            }
            catch (error) {
                console.error("Error fetching items for shopkeeper:", error);
                throw new Error("Could not retrieve items for the specified shopkeeper.");
            }
        });
    }
}
exports.ShopkeeperItemService = ShopkeeperItemService;
