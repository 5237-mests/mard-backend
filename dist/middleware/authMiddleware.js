"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeUser = exports.authorizeRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("../types"); // Import type extensions
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded;
        next();
    });
};
exports.authenticateToken = authenticateToken;
const authorizeRole = (roles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied. Insufficient permissions." });
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
const authorizeUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "default_secret", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded; // Attach user information to request object
        next();
    });
};
exports.authorizeUser = authorizeUser;
