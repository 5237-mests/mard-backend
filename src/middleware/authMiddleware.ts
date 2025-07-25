import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
}

export function hasRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      if (decoded.role === role) {
        req.user = decoded;
        return next();
      }
      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      res.status(400).json({ message: "Invalid token." });
    }
  };
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Attach user information to request object
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token." });
  }
};

export default authMiddleware;
