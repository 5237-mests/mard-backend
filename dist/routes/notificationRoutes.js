"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const notificationController_1 = require("../controllers/notificationController");
const router = express_1.default.Router();
// List notifications for logged-in user
router.get("/", authMiddleware_1.default, notificationController_1.listNotifications);
// Mark notification as read
router.post("/read", authMiddleware_1.default, notificationController_1.markAsRead);
// Get unread notification count
router.get("/unread-count", authMiddleware_1.default, notificationController_1.unreadCount);
// Delete notification
router.post("/delete", authMiddleware_1.default, notificationController_1.deleteNotificationById);
exports.default = router;
