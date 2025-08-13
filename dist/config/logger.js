"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logStream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure logs directory exists
const logsDir = path_1.default.join(__dirname, '../../logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
// Tell winston that you want to link the colors
winston_1.default.addColors(colors);
// Define which level to log based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
// Define different log formats
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const fileLogFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
// Define transports
const transports = [
    // Console transport
    new winston_1.default.transports.Console({
        format: logFormat,
    }),
    // Error log file
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'error.log'),
        level: 'error',
        format: fileLogFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // Combined log file
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'combined.log'),
        format: fileLogFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
    // HTTP requests log file
    new winston_1.default.transports.File({
        filename: path_1.default.join(logsDir, 'http.log'),
        level: 'http',
        format: fileLogFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
    }),
];
// Create the logger
const logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format: fileLogFormat,
    transports,
    exitOnError: false,
});
// Create a stream object for Morgan
exports.logStream = {
    write: (message) => {
        logger.http(message.trim());
    },
};
exports.default = logger;
