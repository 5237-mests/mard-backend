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
exports.getAnyInventory = exports.getStoreInventory = exports.getShopInventory = void 0;
const db_1 = require("../config/db");
const getShopInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Shopkeeper: view items in their own shop
    try {
        const shopkeeperId = req.user.id;
        const shopSql = `
      SELECT s.*, u.name as shopkeeper_name 
      FROM shops s 
      LEFT JOIN users u ON s.shopkeeperId = u.id 
      WHERE s.shopkeeperId = ?
    `;
        const shops = yield (0, db_1.query)(shopSql, [shopkeeperId]);
        const shop = shops[0];
        if (!shop)
            return res.status(404).json({ message: "Shop not found" });
        const itemsSql = `
      SELECT 
        si.*,
        s.name as shop_name, s.location as shop_location,
        i.name as item_name, i.code as item_code, i.unit as item_unit, i.description as item_description
      FROM shop_items si
      JOIN shops s ON si.shopId = s.id
      JOIN items i ON si.itemId = i.id
      WHERE si.shopId = ?
    `;
        const itemsData = yield (0, db_1.query)(itemsSql, [shop.id]);
        const items = itemsData.map((item) => (Object.assign(Object.assign({}, item), { shop: {
                id: item.shopId,
                name: item.shop_name,
                location: item.shop_location
            }, item: {
                id: item.itemId,
                name: item.item_name,
                code: item.item_code,
                unit: item.item_unit,
                description: item.item_description
            } })));
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching shop inventory", error });
    }
});
exports.getShopInventory = getShopInventory;
const getStoreInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Storekeeper: view items in their assigned store
    try {
        const storekeeperId = req.user.id;
        const storeSql = `
      SELECT st.*, u.name as storekeeper_name 
      FROM stores st 
      LEFT JOIN users u ON st.storekeeperId = u.id 
      WHERE st.storekeeperId = ?
    `;
        const stores = yield (0, db_1.query)(storeSql, [storekeeperId]);
        const store = stores[0];
        if (!store)
            return res.status(404).json({ message: "Store not found" });
        const itemsSql = `
      SELECT 
        sti.*,
        st.name as store_name, st.location as store_location,
        i.name as item_name, i.code as item_code, i.unit as item_unit, i.description as item_description
      FROM store_items sti
      JOIN stores st ON sti.storeId = st.id
      JOIN items i ON sti.itemId = i.id
      WHERE sti.storeId = ?
    `;
        const itemsData = yield (0, db_1.query)(itemsSql, [store.id]);
        const items = itemsData.map((item) => (Object.assign(Object.assign({}, item), { store: {
                id: item.storeId,
                name: item.store_name,
                location: item.store_location
            }, item: {
                id: item.itemId,
                name: item.item_name,
                code: item.item_code,
                unit: item.item_unit,
                description: item.item_description
            } })));
        res.status(200).json(items);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching store inventory", error });
    }
});
exports.getStoreInventory = getStoreInventory;
const getAnyInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Admin: view any shop/store's inventory
    try {
        const { shopId, storeId } = req.query;
        if (shopId) {
            const itemsSql = `
        SELECT 
          si.*,
          s.name as shop_name, s.location as shop_location,
          i.name as item_name, i.code as item_code, i.unit as item_unit, i.description as item_description
        FROM shop_items si
        JOIN shops s ON si.shopId = s.id
        JOIN items i ON si.itemId = i.id
        WHERE si.shopId = ?
      `;
            const itemsData = yield (0, db_1.query)(itemsSql, [parseInt(shopId)]);
            const items = itemsData.map((item) => (Object.assign(Object.assign({}, item), { shop: {
                    id: item.shopId,
                    name: item.shop_name,
                    location: item.shop_location
                }, item: {
                    id: item.itemId,
                    name: item.item_name,
                    code: item.item_code,
                    unit: item.item_unit,
                    description: item.item_description
                } })));
            return res.status(200).json(items);
        }
        if (storeId) {
            const itemsSql = `
        SELECT 
          sti.*,
          st.name as store_name, st.location as store_location,
          i.name as item_name, i.code as item_code, i.unit as item_unit, i.description as item_description
        FROM store_items sti
        JOIN stores st ON sti.storeId = st.id
        JOIN items i ON sti.itemId = i.id
        WHERE sti.storeId = ?
      `;
            const itemsData = yield (0, db_1.query)(itemsSql, [parseInt(storeId)]);
            const items = itemsData.map((item) => (Object.assign(Object.assign({}, item), { store: {
                    id: item.storeId,
                    name: item.store_name,
                    location: item.store_location
                }, item: {
                    id: item.itemId,
                    name: item.item_name,
                    code: item.item_code,
                    unit: item.item_unit,
                    description: item.item_description
                } })));
            return res.status(200).json(items);
        }
        return res.status(400).json({ message: "Provide shopId or storeId" });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching inventory", error });
    }
});
exports.getAnyInventory = getAnyInventory;
