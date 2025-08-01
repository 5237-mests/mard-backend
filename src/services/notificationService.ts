import { prisma } from "../config/db";
import Notification from "../models/Notification";

export const createNotification = async (userId: string, message: string) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
  if (!user) throw new Error("User not found");
  
  await prisma.notification.create({
    data: { userId: user.id, message, read: false }
  });
};

export const getUserNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId: parseInt(userId) },
    include: { user: true },
    orderBy: { createdAt: 'desc' }
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  await prisma.notification.update({
    where: { id: parseInt(notificationId) },
    data: { read: true }
  });
};

export const getUnreadNotificationCount = async (userId: string) => {
  return await prisma.notification.count({
    where: { 
      userId: parseInt(userId),
      read: false 
    }
  });
};

export const deleteNotification = async (notificationId: string) => {
  await prisma.notification.delete({ where: { id: parseInt(notificationId) } });
};
