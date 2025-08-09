import express from "express";
import categoryController from "../controllers/categoryController";

const router = express.Router();

// Route to get all categories
router.get("/all", categoryController.getAllCategories);

// Route to create a new category
router.post("/", categoryController.createCategory);

// Route to get a category by ID
router.get("/:id", categoryController.getCategoryById);

// Route to update a category by ID
router.put("/:id", categoryController.updateCategory);

// Route to delete a category by ID
router.delete("/:id", categoryController.deleteCategory);

export default router;
