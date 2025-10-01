"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const itemController_1 = __importDefault(require("../controllers/itemController"));
const router = express_1.default.Router();
router.get("/all", authMiddleware_1.authenticateToken, itemController_1.default.getAllItems.bind(itemController_1.default));
router.get("/:id", authMiddleware_1.authenticateToken, itemController_1.default.getItemById.bind(itemController_1.default));
router.post("/create", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), itemController_1.default.createItem.bind(itemController_1.default));
router.put("/update/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), itemController_1.default.updateItem.bind(itemController_1.default));
router.delete("/delete/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), itemController_1.default.deleteItem.bind(itemController_1.default));
exports.default = router;
