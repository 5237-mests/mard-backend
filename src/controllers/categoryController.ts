import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";

class CategoryController {
  /**
   * Fetch all categories from the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A JSON response containing an array of all categories in the database
   */
  async getAllCategories(req: Request, res: Response) {
    try {
      const categoryService = new CategoryService();
      const categories = await categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching categories.",
        details: error,
      });
    }
  }

  /**
   * Create a new category in the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A JSON response containing the newly created category
   */
  async createCategory(req: Request, res: Response) {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name is required." });
    }

    try {
      const categoryService = new CategoryService();
      const newCategory = await categoryService.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while creating the category.",
        details: error,
      });
    }
  }

  /**
   * Fetch a category by its ID from the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A JSON response containing the category if found, otherwise a 404 error
   */
  async getCategoryById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const categoryService = new CategoryService();
      const category = await categoryService.getCategoryById(Number(id));
      if (category) {
        res.status(200).json(category);
      } else {
        res.status(404).json({ error: "Category not found." });
      }
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching the category.",
        details: error,
      });
    }
  }

  /**
   * Update an existing category in the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A JSON response containing the updated category if successful, otherwise a 404 error
   */
  async updateCategory(req: Request, res: Response) {
    const { id } = req.params;
    const categoryData = req.body;

    if (!categoryData || Object.keys(categoryData).length === 0) {
      return res.status(400).json({ error: "No data provided for update." });
    }

    try {
      const categoryService = new CategoryService();
      const updatedCategory = await categoryService.updateCategory(
        Number(id),
        categoryData
      );
      if (updatedCategory) {
        res.status(200).json(updatedCategory);
      } else {
        res.status(404).json({ error: "Category not found." });
      }
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while updating the category.",
        details: error,
      });
    }
  }

  /**
   * Delete a category by its ID from the database.
   * @param req - Express request object
   * @param res - Express response object
   * @returns A JSON response indicating success or failure of the deletion
   */
  async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const categoryService = new CategoryService();
      await categoryService.deleteCategory(Number(id));
      res.status(204).send(); // No content
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while deleting the category.",
        details: error,
      });
    }
  }
}

export default new CategoryController();
