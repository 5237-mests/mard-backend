import { Request, Response, NextFunction } from "express";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";
import "../types";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "default_secret",
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = decoded;
      next();
    }
  );
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
    // decode token to get user role
    const decodedtoken = jwt.decode(token) as JwtPayload;

    const userRole = decodedtoken?.user?.role;

    if (!userRole) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!roles.includes(userRole)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  };
};

export const authorizeUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "default_secret",
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      req.user = decoded; // Attach user information to request object
      next();
    }
  );
};
