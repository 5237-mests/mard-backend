import { Category } from "../types/database";
import { query } from "../config/db";

export class CategoryService {
  async getAllCategories() {
    const sql = "SELECT * FROM categories";
    const result = await query(sql);
    return result;
  }

  /**
   * Fetch a category by its ID from the database.
   * @param id - The ID of the category to fetch
   * @returns A category object if found, otherwise null
   */
  async getCategoryById(id: number) {
    const sql = "SELECT * FROM categories WHERE id = ?";
    const result = await query(sql, [id]);
    return result;
  }

  /**
   * Create a new category in the database
   * @param category - The category object to create
   * @returns The newly created category object
   */
  async createCategory(category: Category) {
    const sql = "INSERT INTO categories (name) VALUES (?)";
    const result = await query(sql, [category.name]);
    return result;
  }

  /**
   * Update an existing category in the database.
   * @param id - The ID of the category to update
   * @param category - An object containing the category fields to update
   * @returns The updated category object if successful, otherwise null
   */

  async updateCategory(id: number, categoryData: Partial<Category>) {
    const setValues = Object.entries(categoryData)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key} = ?`)
      .join(", ");
    const updateSql = `UPDATE categories SET ${setValues} WHERE id = ?`;
    const result = await query(updateSql, [...Object.values(categoryData), id]);

    return result;
  }

  /**
   * Delete a category by its ID from the database.
   * @param id - The ID of the category to delete
   */
  async deleteCategory(id: number) {
    const sql = "DELETE FROM categories WHERE id = ?";
    await query(sql, [id]);
  }
}
