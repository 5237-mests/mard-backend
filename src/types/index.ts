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
