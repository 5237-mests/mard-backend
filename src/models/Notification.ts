import { Notification as PrismaNotification } from "../types/prisma";
import User from "./user";

export interface INotification {
  id: number;
  user: User;
  message: string;
  read: boolean;
  createdAt: Date;
}

// Export Prisma Notification type as default
export type Notification = PrismaNotification;
export default Notification;
