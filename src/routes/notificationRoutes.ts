import { authenticateToken } from "../middleware/authMiddleware";
import express from "express";
import {
  listNotifications,
  markAsRead,
  unreadCount,
  deleteNotificationById,
} from "../controllers/notificationController";

const router = express.Router();

// Route to get all notifications for the authenticated user
router.get("/", authenticateToken, listNotifications);

// Route to mark a notification as read
router.post("/read", authenticateToken, markAsRead);

// Route to get unread notification count
router.get("/unread-count", authenticateToken, unreadCount);

// Route to delete a notification
router.post("/delete", authenticateToken, deleteNotificationById);

export default router;
