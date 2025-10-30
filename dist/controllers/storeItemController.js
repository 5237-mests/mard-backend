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
exports.storeItemController = void 0;
// import { storeItemService } from "../services/storeItemService";
const storeItemService_1 = require("../services/storeItemService");
class storeItemController {
    static addstoreItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId, itemId } = req.params;
            const { quantity } = req.body;
            if (!quantity || isNaN(parseInt(quantity, 10))) {
                res
                    .status(400)
                    .json({ message: "Quantity is required and must be a number." });
                return [];
            }
            try {
                const newstoreItem = yield storeItemService_1.StoreItemService.addstoreItem(parseInt(storeId, 10), parseInt(itemId, 10), parseInt(quantity, 10));
                res.status(201).json(newstoreItem);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
            return [];
        });
    }
    static updatestoreItemQuantity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId, itemId } = req.params;
            const { quantity } = req.body;
            if (!quantity || isNaN(parseInt(quantity, 10))) {
                res
                    .status(400)
                    .json({ message: "Quantity is required and must be a number." });
                return;
            }
            try {
                const success = yield storeItemService_1.StoreItemService.updatestoreItemQuantity(parseInt(storeId, 10), parseInt(itemId, 10), parseInt(quantity, 10));
                if (!success) {
                    res.status(404).json({ message: "Item not found in this store." });
                    return;
                }
                res.status(200).json({ message: "Quantity updated successfully." });
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static deletestoreItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId, itemId } = req.params;
            try {
                const success = yield storeItemService_1.StoreItemService.deletestoreItem(parseInt(storeId, 10), parseInt(itemId, 10));
                if (!success) {
                    res.status(404).json({ message: "Item not found in this store." });
                    return;
                }
                res.status(204).send(); // No content
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getItemsBystoreId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            try {
                const items = yield storeItemService_1.StoreItemService.getItemsBystoreId(parseInt(storeId, 10));
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
                const items = yield storeItemService_1.StoreItemService.getItemByItemId(parseInt(itemId, 10));
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    static getItemsBystoreIdAndItemId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId, itemId } = req.params;
            try {
                const items = yield storeItemService_1.StoreItemService.getItemsBystoreIdAndItemId(parseInt(storeId, 10), parseInt(itemId, 10));
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    // get all item from all store
    static getAllstoreItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield storeItemService_1.StoreItemService.getAllItems();
                res.status(200).json(items);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
    // Add multiple items to a store
    static addMultiplestoreItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            const rawItems = (req.body && req.body.items) || [];
            if (!Array.isArray(rawItems) || rawItems.length === 0) {
                res
                    .status(400)
                    .json({ message: "Items array is required and cannot be empty." });
                return;
            }
            // Normalize & validate each item
            const items = [];
            for (const it of rawItems) {
                const itemId = Number(it === null || it === void 0 ? void 0 : it.itemId);
                const quantity = Number(it === null || it === void 0 ? void 0 : it.quantity);
                if (!Number.isInteger(itemId) ||
                    !Number.isFinite(quantity) ||
                    quantity <= 0) {
                    res.status(400).json({
                        message: "Each item must include integer itemId and a positive numeric quantity.",
                    });
                    return;
                }
                items.push({ itemId, quantity });
            }
            try {
                const result = yield storeItemService_1.StoreItemService.addMultiplestoreItems(parseInt(storeId, 10), items);
                res.status(201).json(result);
            }
            catch (error) {
                res.status(500).json({ message: error.message });
            }
        });
    }
}
exports.storeItemController = storeItemController;
