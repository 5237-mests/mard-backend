import Notification from "../models/Notification";

export async function sendNotification(userId: string, message: string) {
  await Notification.create({ user: userId, message });
}

export async function getNotifications(userId: string) {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 });
}

export async function markNotificationRead(notificationId: string) {
  // Mark a specific notification as read
  await Notification.findByIdAndUpdate(notificationId, { read: true });
}

export async function getUnreadCount(userId: string) {
  return await Notification.countDocuments({ user: userId, read: false });
}

export async function deleteNotification(notificationId: string) {
  await Notification.findByIdAndDelete(notificationId);
}
