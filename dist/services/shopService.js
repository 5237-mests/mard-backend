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
            return yield db_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Update shop item quantities
                for (const { itemId, quantitySold } of items) {
                    const shopItem = yield tx.shopItem.findFirst({
                        where: { shopId: parseInt(shopId), itemId: parseInt(itemId) }
                    });
                    if (shopItem) {
                        yield tx.shopItem.update({
                            where: { id: shopItem.id },
                            data: { quantity: shopItem.quantity - quantitySold }
                        });
                    }
                }
                // Create sale record
                const shop = yield tx.shop.findUnique({ where: { id: parseInt(shopId) } });
                const seller = yield tx.user.findUnique({ where: { id: parseInt(soldBy) } });
                if (!shop || !seller) {
                    throw new Error("Shop or seller not found");
                }
                const saleItems = items.map(item => ({
                    itemId: parseInt(item.itemId),
                    quantitySold: item.quantitySold
                }));
                return yield tx.sale.create({
                    data: {
                        shopId: shop.id,
                        items: saleItems, // Cast to any to handle JSON type
                        soldById: seller.id,
                    },
                    include: {
                        shop: true,
                        soldBy: true,
                    },
                });
            }));
        });
    }
    getSales(filter, itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            let sales = yield db_1.prisma.sale.findMany({
                include: {
                    shop: true,
                    soldBy: true,
                }
            });
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
