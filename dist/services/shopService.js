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
exports.ShopService = void 0;
const db_1 = require("../config/db");
class ShopService {
    /**
     * Creates a new shop in the database.
     * @param name The name of the shop.
     * @param location The location of the shop.
     * @returns The newly created shop object.
     */
    static createShop(name, location) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "INSERT INTO shops (name, location) VALUES (?, ?)";
            const params = [name, location];
            try {
                const result = yield (0, db_1.query)(sql, params);
                return result;
            }
            catch (error) {
                console.error("Error creating shop:", error);
                throw new Error("Could not create shop.");
            }
        });
    }
    static getShops() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `
      SELECT 
        s.id, s.name, s.location,
        COALESCE(
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'role', u.role,
              'phone', u.phone
            )
          ),
          '[]'
        ) as shopkeepers
      FROM shops s
      LEFT JOIN shop_shopkeepers sk ON s.id = sk.shop_id
      LEFT JOIN users u ON sk.user_id = u.id
      GROUP BY s.id, s.name, s.location
      HAVING COUNT(u.id) > 0 OR COUNT(*) > 0
    `;
            try {
                const rows = yield (0, db_1.query)(sql);
                return rows.map((row) => ({
                    id: row.id,
                    name: row.name,
                    address: row.location,
                    shopkeepers: JSON.parse(row.shopkeepers).map((sk) => ({
                        id: sk.id,
                        name: sk.name,
                        email: sk.email,
                        role: sk.role,
                        phone: sk.phone,
                    })),
                }));
            }
            catch (error) {
                console.error("Error fetching shops with shopkeepers:", error);
                throw new Error(`Error fetching shops with shopkeepers: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        });
    }
    /**
     * Retrieves a single shop by its ID.
     * @param id The ID of the shop to retrieve.
     * @returns The shop object or null if not found.
     */
    static getShopById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM shops WHERE id = ?";
            try {
                const rows = yield (0, db_1.query)(sql, [id]);
                if (rows.length === 0) {
                    return [];
                }
                return rows;
            }
            catch (error) {
                console.error("Error fetching shop by ID:", error);
                throw new Error("Could not fetch shop.");
            }
        });
    }
    /**
     * Updates an existing shop.
     * @param id The ID of the shop to update.
     * @param name The new name of the shop (optional).
     * @param location The new location of the shop (optional).
     * @returns The updated shop object or null if the shop was not found.
     */
    static updateShop(id, name, location) {
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
            const sql = `UPDATE shops SET ${updates.join(", ")} WHERE id = ?`;
            params.push(id);
            try {
                const result = yield (0, db_1.query)(sql, params);
                // if (result["affectedRows"] === 0) {
                //   return [];
                // }
                return this.getShopById(id);
            }
            catch (error) {
                console.error("Error updating shop:", error);
                throw new Error("Could not update shop.");
            }
        });
    }
    /**
     * Deletes a shop by its ID.
     * @param id The ID of the shop to delete.
     * @returns A boolean indicating if the deletion was successful.
     */
    static deleteShop(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM shops WHERE id = ?";
            try {
                const result = yield (0, db_1.query)(sql, [id]);
                // return result.affectedRows > 0;
                return true;
            }
            catch (error) {
                console.error("Error deleting shop:", error);
                throw new Error("Could not delete shop.");
            }
        });
    }
    /**
     * Process a sale in a shop by updating shop item quantities and
     * creating a sale record.
     *
     * @param shopId The ID of the shop where the sale was made.
     * @param items An array of items sold, each containing an itemId and
     *              quantitySold.
     * @param soldBy The ID of the user who sold the items.
     * @returns A SaleWithRelations object representing the newly created sale.
     * @throws Error if the shop or seller are not found.
     */
    processSale(shopId, items, soldBy) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // Update shop item quantities
                for (const { itemId, quantitySold } of items) {
                    const findShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
                    const [shopItems] = yield connection.execute(findShopItemSql, [
                        parseInt(shopId),
                        parseInt(itemId),
                    ]);
                    const shopItem = shopItems[0];
                    if (shopItem) {
                        const updateQuantitySql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
                        yield connection.execute(updateQuantitySql, [
                            quantitySold,
                            shopItem.id,
                        ]);
                    }
                }
                // Verify shop and seller exist
                const shopSql = "SELECT * FROM shops WHERE id = ?";
                const [shops] = yield connection.execute(shopSql, [parseInt(shopId)]);
                const shop = shops[0];
                const sellerSql = "SELECT * FROM users WHERE id = ?";
                const [sellers] = yield connection.execute(sellerSql, [parseInt(soldBy)]);
                const seller = sellers[0];
                if (!shop || !seller) {
                    throw new Error("Shop or seller not found");
                }
                const saleItems = items.map((item) => ({
                    itemId: parseInt(item.itemId),
                    quantitySold: item.quantitySold,
                }));
                // Create sale record
                const createSaleSql = `
        INSERT INTO sales (shopId, items, soldById)
        VALUES (?, ?, ?)
      `;
                const [saleResult] = yield connection.execute(createSaleSql, [
                    shop.id,
                    JSON.stringify(saleItems),
                    seller.id,
                ]);
                // Fetch the created sale with relations
                const saleId = saleResult.insertId;
                const getSaleSql = `
        SELECT 
          s.*,
          sh.name as shop_name, sh.location as shop_location,
          u.name as soldBy_name, u.email as soldBy_email
        FROM sales s
        JOIN shops sh ON s.shopId = sh.id
        JOIN users u ON s.soldById = u.id
        WHERE s.id = ?
      `;
                const [saleData] = yield connection.execute(getSaleSql, [saleId]);
                const sale = saleData[0];
                return Object.assign(Object.assign({}, sale), { shop: {
                        id: sale.shopId,
                        name: sale.shop_name,
                        location: sale.shop_location,
                    }, soldBy: {
                        id: sale.soldById,
                        name: sale.soldBy_name,
                        email: sale.soldBy_email,
                    }, items: JSON.parse(sale.items) });
            }));
        });
    }
    getSales(filter, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            let sql = `
      SELECT 
        s.*,
        sh.name as shop_name, sh.location as shop_location,
        u.name as soldBy_name, u.email as soldBy_email
      FROM sales s
      JOIN shops sh ON s.shopId = sh.id
      JOIN users u ON s.soldById = u.id
      ORDER BY s.soldAt DESC
    `;
            const salesData = yield (0, db_1.query)(sql);
            let sales = salesData.map((sale) => (Object.assign(Object.assign({}, sale), { shop: {
                    id: sale.shopId,
                    name: sale.shop_name,
                    location: sale.shop_location,
                }, soldBy: {
                    id: sale.soldById,
                    name: sale.soldBy_name,
                    email: sale.soldBy_email,
                }, items: JSON.parse(sale.items) })));
            if (itemId) {
                sales = sales.filter((sale) => {
                    const saleItems = sale.items;
                    return saleItems.some((item) => item.itemId.toString() === itemId);
                });
            }
            return sales;
        });
    }
}
exports.ShopService = ShopService;
