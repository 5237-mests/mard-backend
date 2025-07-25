import { Request, Response } from "express";

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "MARD API is healthy 🚀" });
};

export default { getHealthStatus };
