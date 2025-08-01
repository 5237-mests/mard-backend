import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import express from "express";
import { processSale, getSales } from "../controllers/shopController";

const router = express.Router();

// Route to process a sale (only shopkeeper or admin can do this)
router.post(
  "/sale",
  authenticateToken,
  authorizeRole(["SHOPKEEPER", "ADMIN"]),
  processSale
);

// Route to get sales data (only admin can do this)
router.get(
  "/sales",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  getSales
);

export default router;
