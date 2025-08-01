import express from "express";
import authMiddleware from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

import { processSale, getSales } from "../controllers/shopController";

const router = express.Router();

// API for shopkeeper to update item quantities after a sale
// Record a sale and update inventory
router.post(
  "/sale",
  authMiddleware,
  roleMiddleware(["shopkeeper"]),
  processSale
);

// Get all sales for a shop
router.get(
  "/sales",
  authMiddleware,
  roleMiddleware(["shopkeeper", "admin"]),
  getSales
);

export default router;
