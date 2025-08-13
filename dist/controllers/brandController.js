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
exports.BrandController = void 0;
const brandService_1 = require("../services/brandService");
class BrandController {
    /**
     * Fetch all brands from the database.
     * @param req - Express request object
     * @param res - Express response object
     */
    getAllBrands(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const brandService = new brandService_1.BrandService();
                const brands = yield brandService.getAllBrands();
                res.status(200).json(brands);
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while fetching brands.",
                    details: error,
                });
            }
        });
    }
    /**
     * Create a new brand.
     * @param req - Express request object
     * @param res - Express response object
     */
    createBrand(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const brandService = new brandService_1.BrandService();
                const brandData = req.body;
                const brand = yield brandService.createBrand(brandData);
                res.status(201).json(brand);
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while creating a brand.",
                    details: error,
                });
            }
        });
    }
    /**
     * Delete a brand by ID.
     * @param req - Express request object
     * @param res - Express response object
     */
    deleteBrand(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const brandService = new brandService_1.BrandService();
                const brandId = parseInt(req.params.id, 10);
                yield brandService.deleteBrand(brandId);
                res.status(200).json({ message: "Brand deleted successfully" });
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while deleting the brand.",
                    details: error,
                });
            }
        });
    }
    /**
     * Update a brand by ID.
     * @param req - Express request object
     * @param res - Express response object
     */
    updateBrand(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const brandService = new brandService_1.BrandService();
                const brandId = parseInt(req.params.id, 10);
                const brandData = req.body;
                const updatedBrand = yield brandService.updateBrand(brandId, brandData);
                res.status(200).json(updatedBrand);
            }
            catch (error) {
                res.status(500).json({
                    error: "An error occurred while updating the brand.",
                    details: error,
                });
            }
        });
    }
}
exports.BrandController = BrandController;
exports.default = new BrandController();
