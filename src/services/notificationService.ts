import { AppDataSource } from "../config/db";
import Notification from "../models/Notification";
import User from "../models/user";

export async function sendNotification(userId: string, message: string) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  const userRepository = AppDataSource.getRepository(User);
  
  const user = await userRepository.findOne({ where: { id: parseInt(userId) } });
  if (!user) throw new Error("User not found");
  
  await notificationRepository.save({ user, message, read: false });
}

export async function getNotifications(userId: string) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  return await notificationRepository.find({ 
    where: { user: { id: parseInt(userId) } },
    relations: ["user"],
    order: { createdAt: "DESC" }
  });
}

export async function markNotificationRead(notificationId: string) {
  // Mark a specific notification as read
  const notificationRepository = AppDataSource.getRepository(Notification);
  await notificationRepository.update(
    { id: parseInt(notificationId) },
    { read: true }
  );
}

export async function getUnreadCount(userId: string) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  return await notificationRepository.count({ 
    where: { user: { id: parseInt(userId) }, read: false }
  });
}

export async function deleteNotification(notificationId: string) {
  const notificationRepository = AppDataSource.getRepository(Notification);
  await notificationRepository.delete({ id: parseInt(notificationId) });
}
