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
exports.ShopService = void 0;
const db_1 = require("../config/db");
const ShopItem_1 = __importDefault(require("../models/ShopItem"));
const Sale_1 = __importDefault(require("../models/Sale"));
const Shop_1 = __importDefault(require("../models/Shop"));
const user_1 = __importDefault(require("../models/user"));
class ShopService {
    processSale(shopId, items, soldBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const shopItemRepository = db_1.AppDataSource.getRepository(ShopItem_1.default);
            const saleRepository = db_1.AppDataSource.getRepository(Sale_1.default);
            const shopRepository = db_1.AppDataSource.getRepository(Shop_1.default);
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            // Update shop item quantities
            for (const { itemId, quantitySold } of items) {
                const shopItem = yield shopItemRepository.findOne({
                    where: { shop: { id: parseInt(shopId) }, item: { id: parseInt(itemId) } }
                });
                if (shopItem) {
                    yield shopItemRepository.update({ shop: { id: parseInt(shopId) }, item: { id: parseInt(itemId) } }, { quantity: shopItem.quantity - quantitySold });
                }
            }
            // Create sale record
            const shop = yield shopRepository.findOne({ where: { id: parseInt(shopId) } });
            const seller = yield userRepository.findOne({ where: { id: parseInt(soldBy) } });
            if (!shop || !seller) {
                throw new Error("Shop or seller not found");
            }
            const saleItems = items.map(item => ({
                itemId: parseInt(item.itemId),
                quantitySold: item.quantitySold
            }));
            return yield saleRepository.save({
                shop,
                items: saleItems,
                soldBy: seller
            });
        });
    }
    getSales(filter, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            const saleRepository = db_1.AppDataSource.getRepository(Sale_1.default);
            let sales = yield saleRepository.find({
                relations: ["shop", "soldBy"]
            });
            if (itemId) {
                sales = sales.filter((sale) => sale.items.some((item) => item.itemId.toString() === itemId));
            }
            return sales;
        });
    }
}
exports.ShopService = ShopService;
