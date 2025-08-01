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
        const shop = yield db_1.prisma.shop.findFirst({
            where: { shopkeeperId: shopkeeperId },
            include: { shopkeeper: true }
        });
        if (!shop)
            return res.status(404).json({ message: "Shop not found" });
        const items = yield db_1.prisma.shopItem.findMany({
            where: { shopId: shop.id },
            include: {
                shop: true,
                item: true,
            }
        });
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
        const store = yield db_1.prisma.store.findFirst({
            where: { storekeeperId: storekeeperId },
            include: { storekeeper: true }
        });
        if (!store)
            return res.status(404).json({ message: "Store not found" });
        const items = yield db_1.prisma.storeItem.findMany({
            where: { storeId: store.id },
            include: {
                store: true,
                item: true,
            }
        });
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
            const items = yield db_1.prisma.shopItem.findMany({
                where: { shopId: parseInt(shopId) },
                include: {
                    shop: true,
                    item: true,
                }
            });
            return res.status(200).json(items);
        }
        if (storeId) {
            const items = yield db_1.prisma.storeItem.findMany({
                where: { storeId: parseInt(storeId) },
                include: {
                    store: true,
                    item: true,
                }
            });
            return res.status(200).json(items);
        }
        return res.status(400).json({ message: "Provide shopId or storeId" });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching inventory", error });
    }
});
exports.getAnyInventory = getAnyInventory;
