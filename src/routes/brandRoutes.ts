import express from "express";
import BrandController from "../controllers/brandController";

const router = express.Router();

// Route to get all brands
router.get("/all", BrandController.getAllBrands);
// Route to create a new brand
router.post("/create", BrandController.createBrand);
// Route to delete a brand by ID
router.delete("/:id", BrandController.deleteBrand);
// Route to update a brand by ID
router.put("/:id", BrandController.updateBrand);

export default router;
