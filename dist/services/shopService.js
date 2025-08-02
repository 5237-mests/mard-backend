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
    processSale(shopId, items, soldBy) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, db_1.transaction)((connection) => __awaiter(this, void 0, void 0, function* () {
                // Update shop item quantities
                for (const { itemId, quantitySold } of items) {
                    const findShopItemSql = `
          SELECT * FROM shop_items 
          WHERE shopId = ? AND itemId = ?
        `;
                    const [shopItems] = yield connection.execute(findShopItemSql, [parseInt(shopId), parseInt(itemId)]);
                    const shopItem = shopItems[0];
                    if (shopItem) {
                        const updateQuantitySql = `
            UPDATE shop_items 
            SET quantity = quantity - ? 
            WHERE id = ?
          `;
                        yield connection.execute(updateQuantitySql, [quantitySold, shopItem.id]);
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
                const saleItems = items.map(item => ({
                    itemId: parseInt(item.itemId),
                    quantitySold: item.quantitySold
                }));
                // Create sale record
                const createSaleSql = `
        INSERT INTO sales (shopId, items, soldById)
        VALUES (?, ?, ?)
      `;
                const [saleResult] = yield connection.execute(createSaleSql, [
                    shop.id,
                    JSON.stringify(saleItems),
                    seller.id
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
                        location: sale.shop_location
                    }, soldBy: {
                        id: sale.soldById,
                        name: sale.soldBy_name,
                        email: sale.soldBy_email
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
                    location: sale.shop_location
                }, soldBy: {
                    id: sale.soldById,
                    name: sale.soldBy_name,
                    email: sale.soldBy_email
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
