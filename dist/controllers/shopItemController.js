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
exports.ShopItemController = void 0;
const shopItemService_1 = require("../services/shopItemService");
class ShopItemController {
    static addShopItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, itemId } = req.params;
            const { quantity } = req.body;
            if (!quantity || isNaN(parseInt(quantity, 10))) {
                res
                    .status(400)
                    .json({ message: "Quantity is required and must be a number." });
                return [];
            }
            try {
                const newShopItem = yield shopItemService_1.ShopItemService.addShopItem(parseInt(shopId, 10), parseInt(itemId, 10), parseInt(quantity, 10));
                res.status(201).json(newShopItem);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
            return [];
        });
    }
    static updateShopItemQuantity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, itemId } = req.params;
            const { quantity } = req.body;
            if (!quantity || isNaN(parseInt(quantity, 10))) {
                res
                    .status(400)
                    .json({ message: "Quantity is required and must be a number." });
                return;
            }
            try {
                const success = yield shopItemService_1.ShopItemService.updateShopItemQuantity(parseInt(shopId, 10), parseInt(itemId, 10), parseInt(quantity, 10));
                if (!success) {
                    res.status(404).json({ message: "Item not found in this shop." });
                    return;
                }
                res.status(200).json({ message: "Quantity updated successfully." });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static deleteShopItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, itemId } = req.params;
            try {
                const success = yield shopItemService_1.ShopItemService.deleteShopItem(parseInt(shopId, 10), parseInt(itemId, 10));
                if (!success) {
                    res.status(404).json({ message: "Item not found in this shop." });
                    return;
                }
                res.status(204).send(); // No content
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getItemsByShopId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId } = req.params;
            try {
                const items = yield shopItemService_1.ShopItemService.getItemsByShopId(parseInt(shopId, 10));
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getItemsByItemId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { itemId } = req.params;
            try {
                const items = yield shopItemService_1.ShopItemService.getItemByItemId(parseInt(itemId, 10));
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getItemsByShopIdAndItemId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { shopId, itemId } = req.params;
            try {
                const items = yield shopItemService_1.ShopItemService.getItemsByShopIdAndItemId(parseInt(shopId, 10), parseInt(itemId, 10));
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    // get all item from all shop
    static getAllShopItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield shopItemService_1.ShopItemService.getAllItems();
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.ShopItemController = ShopItemController;
