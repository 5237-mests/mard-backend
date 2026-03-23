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
exports.deleteFixedAsset = exports.updateFixedAsset = exports.getFixedAssets = exports.createFixedAsset = void 0;
const fixedAsset_1 = require("../services/fixedAsset");
const createFixedAsset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, fixedAsset_1.createFixedAssetService)(req.body);
        return res.status(201).json({
            success: true,
            message: "Asset created successfully",
            asset_code: result.asset_code,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create asset",
        });
    }
});
exports.createFixedAsset = createFixedAsset;
const getFixedAssets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const searchStr = typeof search === "string" ? search.trim().slice(0, 100) : undefined;
        const data = yield (0, fixedAsset_1.getFixedAssetsService)(searchStr);
        return res.status(200).json({
            success: true,
            data,
            message: data.length === 0 ? "No assets found" : undefined,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch assets",
        });
    }
});
exports.getFixedAssets = getFixedAssets;
const updateFixedAsset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, fixedAsset_1.updateFixedAssetService)(Number(id), req.body);
        return res.status(200).json({
            success: true,
            message: "Asset updated successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update asset",
        });
    }
});
exports.updateFixedAsset = updateFixedAsset;
const deleteFixedAsset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield (0, fixedAsset_1.deleteFixedAssetService)(Number(id));
        return res.status(200).json({
            success: true,
            message: "Asset deleted successfully",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete asset",
        });
    }
});
exports.deleteFixedAsset = deleteFixedAsset;
