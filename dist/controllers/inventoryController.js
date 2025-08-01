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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnyInventory = exports.getStoreInventory = exports.getShopInventory = void 0;
const db_1 = require("../config/db");
const ShopItem_1 = __importDefault(require("../models/ShopItem"));
const StoreItem_1 = __importDefault(require("../models/StoreItem"));
const Shop_1 = __importDefault(require("../models/Shop"));
const Store_1 = __importDefault(require("../models/Store"));
const getShopInventory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Shopkeeper: view items in their own shop
    try {
        const shopkeeperId = req.user.id;
        const shopRepository = db_1.AppDataSource.getRepository(Shop_1.default);
        const shopItemRepository = db_1.AppDataSource.getRepository(ShopItem_1.default);
        const shop = yield shopRepository.findOne({
            where: { shopkeeper: { id: shopkeeperId } },
            relations: ["shopkeeper"]
        });
        if (!shop)
            return res.status(404).json({ message: "Shop not found" });
        const items = yield shopItemRepository.find({
            where: { shop: { id: shop.id } },
            relations: ["shop", "item"]
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
        const storeRepository = db_1.AppDataSource.getRepository(Store_1.default);
        const storeItemRepository = db_1.AppDataSource.getRepository(StoreItem_1.default);
        const store = yield storeRepository.findOne({
            where: { storekeeper: { id: storekeeperId } },
            relations: ["storekeeper"]
        });
        if (!store)
            return res.status(404).json({ message: "Store not found" });
        const items = yield storeItemRepository.find({
            where: { store: { id: store.id } },
            relations: ["store", "item"]
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
        const shopItemRepository = db_1.AppDataSource.getRepository(ShopItem_1.default);
        const storeItemRepository = db_1.AppDataSource.getRepository(StoreItem_1.default);
        if (shopId) {
            const items = yield shopItemRepository.find({
                where: { shop: { id: parseInt(shopId) } },
                relations: ["shop", "item"]
            });
            return res.status(200).json(items);
        }
        if (storeId) {
            const items = yield storeItemRepository.find({
                where: { store: { id: parseInt(storeId) } },
                relations: ["store", "item"]
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
