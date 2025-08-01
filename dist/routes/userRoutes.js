"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = __importDefault(require("../controllers/userController"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const router = (0, express_1.Router)();
const userController = new userController_1.default();
// Route to get user details
router.get("/me", authMiddleware_1.default, userController.getUserDetails.bind(userController));
// Route to update user role (admin only)
router.put("/role/:id", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["admin"]), userController.updateUserRole.bind(userController));
// Route to list all users (admin only)
router.get("/", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["admin"]), userController.listAllUsers.bind(userController));
exports.default = router;
