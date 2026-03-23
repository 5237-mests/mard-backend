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
    const { search } = req.query;

    const searchStr =
      typeof search === "string" ? search.trim().slice(0, 100) : undefined;

    const data = await getFixedAssetsService(searchStr);

    return res.status(200).json({
      success: true,
      data,
      message: data.length === 0 ? "No assets found" : undefined,
    });
  } catch (error: any) {
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
