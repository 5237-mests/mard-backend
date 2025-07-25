import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";
import {
  requestStockTransfer,
  approveTransferRequest,
  rejectTransferRequest,
  listTransferRequests,
  adminTransfer,
} from "../controllers/transferController";

const router = express.Router();
// List and filter transfer requests
router.get(
  "/list",
  authMiddleware,
  roleMiddleware(["admin", "storekeeper", "shopkeeper"]),
  listTransferRequests
);

// Admin/storekeeper direct transfer
router.post(
  "/admin-transfer",
  authMiddleware,
  roleMiddleware(["admin", "storekeeper"]),
  adminTransfer
);

// Shopkeeper requests transfer to store or another shop
router.post(
  "/request",
  authMiddleware,
  roleMiddleware(["shopkeeper"]),
  requestStockTransfer
);

// Approve a transfer request
router.post(
  "/approve",
  authMiddleware,
  roleMiddleware(["admin", "storekeeper", "shopkeeper"]),
  approveTransferRequest
);

// Reject a transfer request
router.post(
  "/reject",
  authMiddleware,
  roleMiddleware(["admin", "storekeeper", "shopkeeper"]),
  rejectTransferRequest
);

export default router;
