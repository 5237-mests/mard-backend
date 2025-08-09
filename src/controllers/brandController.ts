import { Request, Response } from "express";
import { BrandService } from "../services/brandService";

export class BrandController {
  /**
   * Fetch all brands from the database.
   * @param req - Express request object
   * @param res - Express response object
   */
  async getAllBrands(req: Request, res: Response) {
    try {
      const brandService = new BrandService();
      const brands = await brandService.getAllBrands();
      res.status(200).json(brands);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while fetching brands.",
        details: error,
      });
    }
  }

  /**
   * Create a new brand.
   * @param req - Express request object
   * @param res - Express response object
   */
  async createBrand(req: Request, res: Response) {
    try {
      const brandService = new BrandService();
      const brandData = req.body;
      const brand = await brandService.createBrand(brandData);
      res.status(201).json(brand);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while creating a brand.",
        details: error,
      });
    }
  }

  /**
   * Delete a brand by ID.
   * @param req - Express request object
   * @param res - Express response object
   */
  async deleteBrand(req: Request, res: Response) {
    try {
      const brandService = new BrandService();
      const brandId = parseInt(req.params.id, 10);
      await brandService.deleteBrand(brandId);
      res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while deleting the brand.",
        details: error,
      });
    }
  }

  /**
   * Update a brand by ID.
   * @param req - Express request object
   * @param res - Express response object
   */
  async updateBrand(req: Request, res: Response) {
    try {
      const brandService = new BrandService();
      const brandId = parseInt(req.params.id, 10);
      const brandData = req.body;
      const updatedBrand = await brandService.updateBrand(brandId, brandData);
      res.status(200).json(updatedBrand);
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while updating the brand.",
        details: error,
      });
    }
  }
}

export default new BrandController();
