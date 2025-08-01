"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inventoryController_1 = require("../controllers/inventoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Route for shopkeeper to view their shop's inventory
router.get("/shop", (0, authMiddleware_1.authorizeRole)(["SHOPKEEPER"]), inventoryController_1.getShopInventory);
// Route for storekeeper to view their store's inventory
router.get("/store", (0, authMiddleware_1.authorizeRole)(["STOREKEEPER"]), inventoryController_1.getStoreInventory);
// Route for admin to view any shop/store's inventory
router.get("/any", (0, authMiddleware_1.authorizeRole)(["ADMIN"]), inventoryController_1.getAnyInventory);
exports.default = router;
