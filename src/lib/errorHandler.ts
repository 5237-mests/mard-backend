import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // fallback for unexpected errors
  res.status(500).json({ message: "Internal Server Error" });
};

export default errorHandler;
