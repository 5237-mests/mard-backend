import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  listNotifications,
  markAsRead,
  unreadCount,
  deleteNotificationById,
} from "../controllers/notificationController";

const router = express.Router();

// List notifications for logged-in user
router.get("/", authMiddleware, listNotifications);

// Mark notification as read
router.post("/read", authMiddleware, markAsRead);

// Get unread notification count
router.get("/unread-count", authMiddleware, unreadCount);

// Delete notification
router.post("/delete", authMiddleware, deleteNotificationById);

export default router;
