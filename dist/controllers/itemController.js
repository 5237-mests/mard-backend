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
const itemService_1 = require("../services/itemService");
const promises_1 = __importDefault(require("fs/promises"));
class ItemController {
    /**
     * Retrieves all items from the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A promise that resolves when the response has been sent
     */
    getAllItems(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const itemService = new itemService_1.ItemService();
                const items = yield itemService.getAllItems();
                res.json(items);
            }
            catch (error) {
                console.error("Error fetching items:", error);
                res.status(500).json({ error: "Failed to fetch items" });
            }
        });
    }
    /**
     * Retrieves an item by its ID from the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A promise that resolves when the response has been sent
     */
    getItemById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemId = parseInt(req.params.id, 10);
            if (isNaN(itemId)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
            try {
                const itemService = new itemService_1.ItemService();
                const item = yield itemService.getItemById(itemId);
                if (!item) {
                    return res.status(404).json({ error: "Item not found" });
                }
                res.json(item);
            }
            catch (error) {
                console.error("Error fetching item:", error);
                res.status(500).json({ error: "Failed to fetch item" });
            }
        });
    }
    /**
     * Creates a new item in the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns  A promise that resolves when the response has been sent
     */
    createItem1(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const newItem = req.body;
            if (!newItem || !newItem.name || !newItem.category_id) {
                return res.status(400).json({ error: "Invalid item data" });
            }
            try {
                const itemService = new itemService_1.ItemService();
                const createdItem = yield itemService.createItem(newItem);
                // If item with the same name exists
                if (!createdItem) {
                    return res
                        .status(400)
                        .json({ error: "Item with the same name already exists" });
                }
                res.status(201).json(createdItem);
            }
            catch (error) {
                console.error("Error creating item:", error);
                res.status(500).json({ error: "Failed to create item" });
            }
        });
    }
    createItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const newItem = req.body;
            const imageFile = req.file;
            if (!newItem || !newItem.name || !newItem.category_id) {
                if (imageFile)
                    yield promises_1.default.unlink(imageFile.path).catch(() => { }); // Cleanup on error
                return res.status(400).json({ error: "Invalid item data" });
            }
            try {
                const imagePath = imageFile ? `/uploads/${imageFile.filename}` : null;
                newItem.image = imagePath;
                const itemService = new itemService_1.ItemService();
                const createdItem = yield itemService.createItem(newItem);
                if (!createdItem) {
                    if (imageFile)
                        yield promises_1.default.unlink(imageFile.path).catch(() => { });
                    return res
                        .status(400)
                        .json({ error: "Item with the same name already exists" });
                }
                res.status(201).json(createdItem);
            }
            catch (error) {
                console.error("Error creating item:", error);
                if (imageFile)
                    yield promises_1.default.unlink(imageFile.path).catch(() => { });
                res.status(500).json({ error: "Failed to create item" });
            }
        });
    }
    /**
     * Updates an item in the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A promise that resolves when the response has been sent
     */
    updateItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemId = parseInt(req.params.id, 10);
            if (isNaN(itemId)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
            const updatedItem = req.body;
            try {
                const itemService = new itemService_1.ItemService();
                const item = yield itemService.updateItem(itemId, updatedItem);
                if (!item) {
                    return res.status(404).json({ error: "Item not found" });
                }
                res.json(item);
            }
            catch (error) {
                console.error("Error updating item:", error);
                res.status(500).json({ error: "Failed to update item" });
            }
        });
    }
    /**
     * Deletes an item by its ID from the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A promise that resolves when the response has been sent
     */
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const itemId = parseInt(req.params.id, 10);
            if (isNaN(itemId)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
            try {
                const itemService = new itemService_1.ItemService();
                yield itemService.deleteItem(itemId);
                res.status(200).json({ message: "Item deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting item:", error);
                res.status(500).json({ error: "Failed to delete item" });
            }
        });
    }
}
exports.default = new ItemController();
