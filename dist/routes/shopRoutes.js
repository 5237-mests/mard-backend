"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const shopController_1 = require("../controllers/shopController");
const router = express_1.default.Router();
// API for shopkeeper to update item quantities after a sale
// Record a sale and update inventory
router.post("/sale", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["shopkeeper"]), shopController_1.processSale);
// Get all sales for a shop
router.get("/sales", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["shopkeeper", "admin"]), shopController_1.getSales);
exports.default = router;
