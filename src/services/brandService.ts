import { query } from "../config/db";
import { Brand } from "../types/database";

export class BrandService {
  // Fetch all brands from the database
  async getAllBrands() {
    const sql = "SELECT * FROM brands ORDER BY name ASC";
    const brands = await query(sql);
    return brands;
  }

  // Additional methods for brand management can be added here
  // Create a new brand
  async createBrand(brandData: Brand) {
    const params = [brandData.name, brandData.slug];
    const sql = "INSERT INTO brands (name, slug) VALUES (?, ?)";
    await query(sql, params);
    return brandData;
  }

  // Delete a brand by ID
  async deleteBrand(brandId: number) {
    const sql = "DELETE FROM brands WHERE id = ?";
    await query(sql, [brandId]);
    return { message: "Brand deleted successfully" };
  }

  // Update a brand by ID
  async updateBrand(brandId: number, brandData: Brand) {
    // Update brand in the database
    const params = [brandData.name, brandData.slug, brandId];
    const sql = "UPDATE brands SET name = ?, slug = ? WHERE id = ?";
    await query(sql, params);
    return { message: "Brand updated successfully" };
  }
}
