import express from "express";
import { SalesController } from "../controllers/salesController";
import {
  authenticateToken,
  authorizeUser,
  authorizeRole,
} from "../middleware/authMiddleware";
import { SalesPaymentController } from "../controllers/salesPaymentController";

const router = express.Router();

// POST /api/sales - Process a sale with multiple items.
router.post(
  "/",
  authenticateToken,
  authorizeUser,
  authorizeRole(["ADMIN", "SHOPKEEPER"]),
  SalesController.createSale,
);

router.post("/pay", authenticateToken, SalesPaymentController.paySale);

// GET /api/sales?shopId= - Retrieve sales for a specific shop
router.get("/", authenticateToken, SalesController.getSales);

// GET all sales for admin
router.get(
  "/all",
  authenticateToken,
  authorizeRole(["ADMIN", "SHOPKEEPER", "STOREKEEPER"]),
  SalesController.getSales,
  // SalesController.getAllSales,
);

// GET /api/sales/:id - Retrieve sale by ID
router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  SalesController.getSaleById,
);

export default router;
