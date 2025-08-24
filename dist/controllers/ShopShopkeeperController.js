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
exports.ShopShopkeeperController = void 0;
const ShopShopkeeperService_1 = require("../services/ShopShopkeeperService");
class ShopShopkeeperController {
    static addShopkeeperToShop(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, userId } = req.params;
            try {
                const newLink = yield ShopShopkeeperService_1.ShopShopkeeperService.addShopkeeperToShop(parseInt(shopId, 10), parseInt(userId, 10));
                res.status(201).json(newLink);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static removeShopkeeperFromShop(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, userId } = req.params;
            try {
                const success = yield ShopShopkeeperService_1.ShopShopkeeperService.removeShopkeeperFromShop(parseInt(shopId, 10), parseInt(userId, 10));
                if (!success) {
                    res.status(404).json({
                        message: "Link not found. Shopkeeper is not assigned to this shop.",
                    });
                    return;
                }
                res.status(204).send(); // No content
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getShopkeepersByShopId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId } = req.params;
            try {
                const shopkeepers = yield ShopShopkeeperService_1.ShopShopkeeperService.getShopkeepersByShopId(parseInt(shopId, 10));
                res.status(200).json(shopkeepers);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getShopsByShopkeeperId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            try {
                const shops = yield ShopShopkeeperService_1.ShopShopkeeperService.getShopsByShopkeeperId(parseInt(userId, 10));
                res.status(200).json(shops);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.ShopShopkeeperController = ShopShopkeeperController;
