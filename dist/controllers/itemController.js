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
const path_1 = __importDefault(require("path"));
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
    createItem01(req, res) {
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
                    yield promises_1.default.unlink(imageFile.path).catch(() => { }); // Cleanup on errorr
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
                res.status(500).json({ error: "Failed to create item." });
            }
        });
    }
    /**
     * Updates an item in the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A promise that resolves when the response has been sent
     */
    updateItem1(req, res) {
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
    updateItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
            const updatedItem = req.body;
            const imageFile = req.file;
            try {
                let imagePath = updatedItem.image; // Existing image if no new upload
                let oldImagePath = null;
                if (imageFile) {
                    imagePath = `/uploads/products/${imageFile.filename}`;
                    // Fetch old image to delete later
                    const itemService = new itemService_1.ItemService();
                    const existingItem = yield itemService.getItemById(id);
                    oldImagePath = (existingItem === null || existingItem === void 0 ? void 0 : existingItem.image) || null;
                }
                const itemService = new itemService_1.ItemService();
                const result = yield itemService.updateItem(id, Object.assign(Object.assign({}, updatedItem), { image: imagePath }));
                if (!result) {
                    if (imageFile)
                        yield promises_1.default.unlink(imageFile.path).catch(() => { });
                    return res.status(404).json({ error: "Item not found" });
                }
                // Delete old image if new one uploaded
                if (oldImagePath && imageFile) {
                    const fullPath = path_1.default.join("public", oldImagePath);
                    yield promises_1.default.unlink(fullPath).catch(() => { }); // Silent fail if not exists
                }
                res.json({ message: "Item updated successfully" });
            }
            catch (error) {
                console.error("Error updating item:", error);
                if (imageFile)
                    yield promises_1.default.unlink(imageFile.path).catch(() => { });
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
    deleteItem1(req, res) {
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
    deleteItem(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ error: "Invalid item ID" });
            }
            try {
                const itemService = new itemService_1.ItemService();
                const item = (yield itemService.getItemById(id));
                if (!item) {
                    return res.status(404).json({ error: "Item not found" });
                }
                // Delete image if exists
                // if (item.image) {
                //   const fullPath = path.join("public", item.image);
                //   await fs.unlink(fullPath).catch(() => {});
                // }
                yield itemService.deleteItem(id);
                res.json({ message: "Item deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting item:", error);
                res.status(500).json({ error: "Failed to delete item" });
            }
        });
    }
}
exports.default = new ItemController();
