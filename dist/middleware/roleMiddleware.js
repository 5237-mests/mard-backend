"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleMiddleware = void 0;
const roleMiddleware = (roles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role; // Assuming user role is attached to req.user by authMiddleware
        if (!userRole) {
            return res.status(403).json({ message: 'Access denied. No role provided.' });
        }
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }
        next();
    };
};
exports.roleMiddleware = roleMiddleware;
