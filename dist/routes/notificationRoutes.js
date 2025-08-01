"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// Route to get all notifications for the authenticated user
router.get("/", authMiddleware_1.authenticateToken, notificationController_1.listNotifications);
// Route to mark a notification as read
router.post("/read", authMiddleware_1.authenticateToken, notificationController_1.markAsRead);
// Route to get unread notification count
router.get("/unread-count", authMiddleware_1.authenticateToken, notificationController_1.unreadCount);
// Route to delete a notification
router.post("/delete", authMiddleware_1.authenticateToken, notificationController_1.deleteNotificationById);
exports.default = router;
