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
exports.CategoryService = void 0;
const db_1 = require("../config/db");
class CategoryService {
    getAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM categories";
            const result = yield (0, db_1.query)(sql);
            return result;
        });
    }
    /**
     * Fetch a category by its ID from the database.
     * @param id - The ID of the category to fetch
     * @returns A category object if found, otherwise null
     */
    getCategoryById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM categories WHERE id = ?";
            const result = yield (0, db_1.query)(sql, [id]);
            return result;
        });
    }
    /**
     * Create a new category in the database
     * @param category - The category object to create
     * @returns The newly created category object
     */
    createCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "INSERT INTO categories (name) VALUES (?)";
            const result = yield (0, db_1.query)(sql, [category.name]);
            return result;
        });
    }
    /**
     * Update an existing category in the database.
     * @param id - The ID of the category to update
     * @param category - An object containing the category fields to update
     * @returns The updated category object if successful, otherwise null
     */
    updateCategory(id, categoryData) {
        return __awaiter(this, void 0, void 0, function* () {
            const setValues = Object.entries(categoryData)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `${key} = ?`)
                .join(", ");
            const updateSql = `UPDATE categories SET ${setValues} WHERE id = ?`;
            const result = yield (0, db_1.query)(updateSql, [...Object.values(categoryData), id]);
            return result;
        });
    }
    /**
     * Delete a category by its ID from the database.
     * @param id - The ID of the category to delete
     */
    deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM categories WHERE id = ?";
            yield (0, db_1.query)(sql, [id]);
        });
    }
}
exports.CategoryService = CategoryService;
