import express from "express";
import BrandController from "../controllers/brandController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

// Route to get all brands
router.get("/all", authenticateToken, BrandController.getAllBrands);
// Route to create a new brand
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  BrandController.createBrand
);

// Route to update a brand by ID
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  BrandController.updateBrand
);

// Route to delete a brand by ID
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  BrandController.deleteBrand
);

export default router;
