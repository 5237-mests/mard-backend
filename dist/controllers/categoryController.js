"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const categoryService_1 = require("../services/categoryService");
class CategoryController {
    /**
     * Fetch all categories from the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A JSON response containing an array of all categories in the database
     */
    getAllCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categoryService = new categoryService_1.CategoryService();
                const categories = yield categoryService.getAllCategories();
                res.status(200).json(categories);
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while fetching categories.",
                    details: error,
                });
            }
        });
    }
    /**
     * Create a new category in the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A JSON response containing the newly created category
     */
    createCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ error: "Category name is required." });
            }
            try {
                const categoryService = new categoryService_1.CategoryService();
                const newCategory = yield categoryService.createCategory(req.body);
                res.status(201).json(newCategory);
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while creating the category.",
                    details: error,
                });
            }
        });
    }
    /**
     * Fetch a category by its ID from the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A JSON response containing the category if found, otherwise a 404 error
     */
    getCategoryById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const categoryService = new categoryService_1.CategoryService();
                const category = yield categoryService.getCategoryById(Number(id));
                if (category) {
                    res.status(200).json(category);
                }
                else {
                    res.status(404).json({ error: "Category not found." });
                }
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while fetching the category.",
                    details: error,
                });
            }
        });
    }
    /**
     * Update an existing category in the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A JSON response containing the updated category if successful, otherwise a 404 error
     */
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const categoryData = req.body;
            if (!categoryData || Object.keys(categoryData).length === 0) {
                return res.status(400).json({ error: "No data provided for update." });
            }
            try {
                const categoryService = new categoryService_1.CategoryService();
                const updatedCategory = yield categoryService.updateCategory(Number(id), categoryData);
                if (updatedCategory) {
                    res.status(200).json(updatedCategory);
                }
                else {
                    res.status(404).json({ error: "Category not found." });
                }
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while updating the category.",
                    details: error,
                });
            }
        });
    }
    /**
     * Delete a category by its ID from the database.
     * @param req - Express request object
     * @param res - Express response object
     * @returns A JSON response indicating success or failure of the deletion
     */
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const categoryService = new categoryService_1.CategoryService();
                yield categoryService.deleteCategory(Number(id));
                res.status(204).send(); // No content
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while deleting the category.",
                    details: error,
                });
            }
        });
    }
}
exports.default = new CategoryController();
