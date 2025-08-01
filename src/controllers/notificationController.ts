import { Request, Response } from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadNotificationCount,
  deleteNotification,
} from "../services/notificationService";

export const unreadCount = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const count = await getUnreadNotificationCount(userId);
    res.status(200).json({ unread: count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unread count", error });
  }
};

export const deleteNotificationById = async (req: Request, res: Response) => {
  const { notificationId } = req.body;
  try {
    await deleteNotification(notificationId);
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error });
  }
};

export const listNotifications = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const notifications = await getUserNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications", error });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.body;
  try {
    await markNotificationAsRead(notificationId);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error marking notification as read", error });
  }
};
