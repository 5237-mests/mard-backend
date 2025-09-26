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
exports.BrandService = void 0;
const db_1 = require("../config/db");
class BrandService {
    // Fetch all brands from the database
    getAllBrands() {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "SELECT * FROM brands ORDER BY name ASC";
            const brands = yield (0, db_1.query)(sql);
            return brands;
        });
    }
    // Additional methods for brand management can be added here
    // Create a new brand
    createBrand(brandData) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = [brandData.name, brandData.slug];
            const sql = "INSERT INTO brands (name, slug) VALUES (?, ?)";
            yield (0, db_1.query)(sql, params);
            return brandData;
        });
    }
    // Delete a brand by ID
    deleteBrand(brandId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = "DELETE FROM brands WHERE id = ?";
            yield (0, db_1.query)(sql, [brandId]);
            return { message: "Brand deleted successfully" };
        });
    }
    // Update a brand by ID
    updateBrand(brandId, brandData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update brand in the database
            const params = [brandData.name, brandData.slug, brandId];
            const sql = "UPDATE brands SET name = ?, slug = ? WHERE id = ?";
            yield (0, db_1.query)(sql, params);
            return { message: "Brand updated successfully" };
        });
    }
}
exports.BrandService = BrandService;
