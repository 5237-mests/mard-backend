import { Notification as DatabaseNotification } from "../types/database";

export interface INotification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Export database Notification type as default
export type Notification = DatabaseNotification;
export default Notification;
