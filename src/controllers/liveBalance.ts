import { Request, Response } from "express";
import { getLiveBalancePivot } from "../services/liveBalance";

interface Location {
  id: number;
  name: string;
  type: "shop" | "store";
  key: string;
}

interface PivotItem {
  item_id: number;
  name: string;
  code: string;
  model: string;
  price: number;
  total_quantity: number;
  [key: string]: any;
}

interface ServiceResult {
  total_distinct_items: number;
  total_number_of_items: number;
  total_asset_valuation: number;
  locations: Location[];
  data: PivotItem[];
}

interface ApiResponse {
  success: boolean;
  total_distinct_items: number;
  total_number_of_items: number;
  total_asset_valuation: number;
  locations: Location[];
  data: PivotItem[];
  message?: string;
}

/**
 * GET /balance/live
 */
export const liveBalancePivot = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    // Basic sanitization
    const searchStr =
      typeof search === "string" ? search.trim().slice(0, 100) : undefined;

    const result: ServiceResult = await getLiveBalancePivot(searchStr);

    if (!result || !Array.isArray(result.data) || result.data.length === 0) {
      return res.status(200).json({
        success: true,
        total_distinct_items: 0,
        total_number_of_items: 0,
        total_asset_valuation: 0,
        locations: result?.locations ?? [],
        data: [],
        message: "No data available",
      });
    }

    const response: ApiResponse = {
      success: true,
      total_distinct_items: result.total_distinct_items,
      total_number_of_items: result.total_number_of_items,
      total_asset_valuation: Number(result.total_asset_valuation.toFixed(2)),
      locations: result.locations,
      data: result.data,
    };

    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch live balance",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
