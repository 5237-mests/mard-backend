// routes/retailerRoutes.ts
import { Router } from "express";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";
import retailerController from "../controllers/retailerController";

const router = Router();

// Route to get all items available to the retailer
router.get(
  "/items",
  // authenticateToken,
  // authorizeRole(["ADMIN","RETAILER"]),
  retailerController.getItems
);

// Route to create a new order
router.post(
  "/orders",
  authenticateToken,
  authorizeRole(["ADMIN", "RETAILER"]),
  authorizeUser,
  retailerController.createOrder
);

// Route to get all orders for the authenticated retailer
router.get(
  "/orders",
  authenticateToken,
  authorizeRole(["ADMIN", "RETAILER"]),
  authorizeUser,
  retailerController.getOrders
);

export default router;
