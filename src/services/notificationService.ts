import { query } from "../config/db";
import { Notification, NotificationWithRelations } from "../types/database";

export const createNotification = async (userId: string, message: string) => {
  const userSql = "SELECT * FROM users WHERE id = ?";
  const users = await query(userSql, [parseInt(userId)]);
  const user = users[0];
  
  if (!user) throw new Error("User not found");
  
  const createSql = `
    INSERT INTO notifications (userId, message, \`read\`)
    VALUES (?, ?, ?)
  `;
  await query(createSql, [user.id, message, false]);
};

export const getUserNotifications = async (userId: string) => {
  const sql = `
    SELECT 
      n.*,
      u.name as user_name, u.email as user_email
    FROM notifications n
    JOIN users u ON n.userId = u.id
    WHERE n.userId = ?
    ORDER BY n.createdAt DESC
  `;
  
  const notificationsData = await query(sql, [parseInt(userId)]);
  return notificationsData.map((notification: any) => ({
    ...notification,
    user: {
      id: notification.userId,
      name: notification.user_name,
      email: notification.user_email
    }
  })) as NotificationWithRelations[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const sql = `
    UPDATE notifications 
    SET \`read\` = ? 
    WHERE id = ?
  `;
  await query(sql, [true, parseInt(notificationId)]);
};

export const getUnreadNotificationCount = async (userId: string) => {
  const sql = `
    SELECT COUNT(*) as count 
    FROM notifications 
    WHERE userId = ? AND \`read\` = ?
  `;
  const result = await query(sql, [parseInt(userId), false]);
  return result[0].count;
};

export const deleteNotification = async (notificationId: string) => {
  const sql = "DELETE FROM notifications WHERE id = ?";
  await query(sql, [parseInt(notificationId)]);
};
