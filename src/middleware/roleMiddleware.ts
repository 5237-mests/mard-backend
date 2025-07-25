import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role; // Assuming user role is attached to req.user by authMiddleware

        if (!userRole) {
            return res.status(403).json({ message: 'Access denied. No role provided.' });
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }

        next();
    };
};