"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brandController_1 = __importDefault(require("../controllers/brandController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Route to get all brands
router.get("/all", authMiddleware_1.authenticateToken, brandController_1.default.getAllBrands);
// Route to create a new brand
router.post("/create", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), brandController_1.default.createBrand);
// Route to update a brand by ID
router.put("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), brandController_1.default.updateBrand);
// Route to delete a brand by ID
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), brandController_1.default.deleteBrand);
exports.default = router;
