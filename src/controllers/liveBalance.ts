import { Request, Response } from "express";
import { getLiveBalancePivot } from "../services/liveBalance";

export const liveBalancePivot = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const result = await getLiveBalancePivot(search as string);
    res.status(200).json({
      success: true,
      data: result.data,
      shops: result.shops,
      stores: result.stores,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pivot balance" });
  }
};
