"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_1 = __importDefault(require("express"));
const shopController_1 = require("../controllers/shopController");
const router = express_1.default.Router();
// Route to process a sale (only shopkeeper or admin can do this)
router.post("/sale", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["SHOPKEEPER", "ADMIN"]), shopController_1.processSale);
// Route to get sales data (only admin can do this)
router.get("/sales", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), shopController_1.getSales);
exports.default = router;
