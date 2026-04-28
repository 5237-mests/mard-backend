import { Request, Response } from "express";
import {
  createFixedAssetService,
  getFixedAssetsService,
  updateFixedAssetService,
  deleteFixedAssetService,
} from "../services/fixedAsset";

export const createFixedAsset = async (req: Request, res: Response) => {
  try {
    const result = await createFixedAssetService(req.body);

    return res.status(201).json({
      success: true,
      message: "Asset created successfully",
      asset_code: result.asset_code,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create asset",
    });
  }
};

export const getFixedAssets = async (req: Request, res: Response) => {
  try {
    const { search, location_type, location_id } = req.query;

    const searchStr =
      typeof search === "string" ? search.trim().slice(0, 100) : undefined;
    const storeType =
      typeof location_type === "string" ? location_type.trim() : undefined;
    const storeId =
      typeof location_id === "string" && location_id
        ? parseInt(location_id)
        : undefined;

    // Basic validation
    if (storeType && !["shop", "store"].includes(storeType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location_type. Must be 'shop' or 'store'.",
      });
    }

    const data = await getFixedAssetsService(searchStr, storeType, storeId);
    const total_asset_cost = data.reduce((acc, curr) => acc + curr.cost, 0);
    return res.status(200).json({
      success: true,
      total_asset_cost,
      data, // ← This is what the frontend expects
      message: data.length === 0 ? "No assets found" : undefined,
    });
  } catch (error: any) {
    console.error("getFixedAssets error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assets",
    });
  }
};

export const updateFixedAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await updateFixedAssetService(Number(id), req.body);

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update asset",
    });
  }
};

export const deleteFixedAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteFixedAssetService(Number(id));

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete asset",
    });
  }
};
