import { Request, Response } from "express";
import { getLiveBalancePivot } from "../services/liveBalance";

interface Location {
  id: number;
  name: string;
}

interface PivotItem {
  item_id: number;
  name: string;
  code: string;
  model: string;
  price: string;
  total_quantity: string;
  [key: string]: any;
}

interface PivotResult {
  shops: Location[];
  stores: Location[];
  data: PivotItem[];
}

interface ApiResponse {
  success: boolean;
  total_distinct_items: number;
  total_number_of_items: number;
  total_asset_valuation: number;
  data: PivotItem[];
  shops: Location[];
  stores: Location[];
  message?: string;
}

/**
 * GET /balance/live
 * Returns pivoted live inventory balance across shops and stores.
 * Supports optional search query (name, code, model).
 */
export const liveBalancePivot = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    // Basic sanitization (prevent injection if passed directly to SQL)
    const searchStr =
      typeof search === "string" ? search.trim().slice(0, 100) : undefined;

    const result: PivotResult = await getLiveBalancePivot(searchStr);

    if (!result || !Array.isArray(result.data)) {
      return res.status(200).json({
        success: true,
        total_distinct_items: 0,
        total_number_of_items: 0,
        total_asset_valuation: 0,
        data: [],
        shops: result?.shops ?? [],
        stores: result?.stores ?? [],
        message: "No data available",
      });
    }

    // Safe number conversion helper
    const toNumber = (val: any): number => {
      const num = Number(val);
      return Number.isNaN(num) ? 0 : num;
    };

    // 1. Count of unique item rows
    const total_distinct_items = result.data.length;

    // 2. Sum of all total_quantity
    const total_number_of_items = result.data.reduce(
      (sum, item) => sum + toNumber(item.total_quantity),
      0,
    );

    // 3. Total valuation = Σ (price × total_quantity)
    const total_asset_valuation = result.data.reduce((sum, item) => {
      const price = toNumber(item.price);
      const qty = toNumber(item.total_quantity);
      return sum + price * qty;
    }, 0);

    const response: ApiResponse = {
      success: true,
      total_distinct_items,
      total_number_of_items,
      // Keep 2 decimal places, but as number (frontend can format nicely)
      total_asset_valuation: Number(total_asset_valuation.toFixed(2)),
      data: result.data,
      shops: result.shops,
      stores: result.stores,
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
