"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = __importDefault(require("../controllers/userController"));
const router = express_1.default.Router();
const userController = new userController_1.default();
// Route to get all users
router.get("/all", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), userController.listAllUsers.bind(userController));
// Route to update a user's role (only admin can do this)
router.put("/role/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), userController.updateUserRole.bind(userController));
// Route to get current user information
router.get("/me/:id", authMiddleware_1.authenticateToken, userController.getUserDetails.bind(userController));
exports.default = router;
