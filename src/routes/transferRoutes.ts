import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import express from "express";
import {
  listTransferRequests,
  adminTransfer,
  requestStockTransfer,
  approveTransferRequest,
  rejectTransferRequest,
} from "../controllers/transferController";

const router = express.Router();

// List all transfer requests (Admin only)
router.get(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  listTransferRequests
);

// Admin direct transfer (Admin only)
router.post(
  "/admin",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  adminTransfer
);

// Request stock transfer (Shopkeeper only)
router.post(
  "/request",
  authenticateToken,
  authorizeRole(["SHOPKEEPER"]),
  requestStockTransfer
);

// Approve transfer request (Admin only)
router.put(
  "/approve",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  approveTransferRequest
);

// Reject transfer request (Admin only)
router.put(
  "/reject",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  rejectTransferRequest
);

export default router;
