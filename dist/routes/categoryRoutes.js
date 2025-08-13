"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = __importDefault(require("../controllers/categoryController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Route to get all categories
router.get("/all", authMiddleware_1.authenticateToken, categoryController_1.default.getAllCategories);
// Route to create a new category
router.post("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), categoryController_1.default.createCategory);
// Route to get a category by ID
router.get("/:id", authMiddleware_1.authenticateToken, categoryController_1.default.getCategoryById);
// Route to update a category by ID
router.put("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), categoryController_1.default.updateCategory);
// Route to delete a category by ID
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), categoryController_1.default.deleteCategory);
exports.default = router;
