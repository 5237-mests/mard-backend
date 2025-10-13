import express from "express";
import { SalesController } from "../controllers/salesController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import { SalesPaymentController } from "../controllers/salesPaymentController";

const router = express.Router();

// POST /api/sales - Process a sale with multiple items
router.post(
  "/sales",
  authenticateToken,
  authorizeRole(["ADMIN", "SHOPKEEPER"]),
  SalesController.createSale
);

router.post("/sales/pay", authenticateToken, SalesPaymentController.paySale);

// GET /api/sales?shopId= - Retrieve sales for a specific shop
router.get("/sales", authenticateToken, SalesController.getSales);

// GET all sales for admin
router.get(
  "/sales/all",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  SalesController.getAllSales
);

export default router;
