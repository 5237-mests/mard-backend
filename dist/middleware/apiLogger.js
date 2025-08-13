"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceLogger = exports.errorLogger = exports.apiLogger = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const apiLogger = (req, res, next) => {
    var _a, _b;
    // Record start time
    req.startTime = Date.now();
    // Capture request body (excluding sensitive data)
    const requestBody = Object.assign({}, req.body);
    if (requestBody.password) {
        requestBody.password = '[REDACTED]';
    }
    if (requestBody.token) {
        requestBody.token = '[REDACTED]';
    }
    // Log request
    logger_1.default.info('API Request', {
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        userRole: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role,
        requestBody: Object.keys(requestBody).length > 0 ? requestBody : undefined,
        timestamp: new Date().toISOString(),
    });
    // Capture original send method
    const originalSend = res.send;
    // Override send method to capture response
    res.send = function (body) {
        var _a, _b;
        const responseTime = Date.now() - (req.startTime || 0);
        // Log response
        logger_1.default.info('API Response', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
            userRole: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role,
            responseBody: body ? (typeof body === 'string' ? body.substring(0, 1000) : body) : undefined,
            timestamp: new Date().toISOString(),
        });
        // Call original send method
        return originalSend.call(this, body);
    };
    next();
};
exports.apiLogger = apiLogger;
// Error logging middleware
const errorLogger = (err, req, res, next) => {
    var _a, _b;
    const responseTime = Date.now() - (req.startTime || 0);
    logger_1.default.error('API Error', {
        method: req.method,
        url: req.url,
        error: err.message,
        stack: err.stack,
        statusCode: res.statusCode || 500,
        responseTime: `${responseTime}ms`,
        userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
        userRole: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || 'Unknown',
        timestamp: new Date().toISOString(),
    });
    next(err);
};
exports.errorLogger = errorLogger;
// Performance monitoring middleware
const performanceLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        var _a, _b;
        const duration = Date.now() - start;
        if (duration > 1000) { // Log slow requests (>1s)
            logger_1.default.warn('Slow API Request', {
                method: req.method,
                url: req.url,
                duration: `${duration}ms`,
                statusCode: res.statusCode,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                userRole: (_b = req.user) === null || _b === void 0 ? void 0 : _b.role,
                timestamp: new Date().toISOString(),
            });
        }
    });
    next();
};
exports.performanceLogger = performanceLogger;
