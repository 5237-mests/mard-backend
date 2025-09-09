// Extend Express Request type to include user property for JWT
import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "shopkeeper" | "storekeeper" | "user";
  status: "active" | "inactive";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  status: "ongoing" | "completed" | "on-hold";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string;
  status: "pending" | "in-progress" | "completed";
}

export interface Cart {
  id: number;
  user_id: number;
  created_at?: Date;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  delivery_address: string;
  created_at?: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price_at_order: number;
}
