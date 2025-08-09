import express from "express";
import categoryController from "../controllers/categoryController";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = express.Router();

// Route to get all categories
router.get("/all", authenticateToken, categoryController.getAllCategories);

// Route to create a new category
router.post(
  "/",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  categoryController.createCategory
);

// Route to get a category by ID
router.get("/:id", authenticateToken, categoryController.getCategoryById);

// Route to update a category by ID
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  categoryController.updateCategory
);

// Route to delete a category by ID
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  categoryController.deleteCategory
);

export default router;
