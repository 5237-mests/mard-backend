"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transaction = exports.query = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config();
// Construct DATABASE_URL if not provided directly
const getDatabaseConfig = () => {
    if (process.env.DATABASE_URL) {
        // Parse DATABASE_URL format: mysql://username:password@host:port/database
        const url = new URL(process.env.DATABASE_URL);
        return {
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // Remove leading slash
        };
    }
    return {
        host: process.env.DATABASE_HOST || process.env.DB_HOST || "mysql",
        port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || "3306"),
        user: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || "root",
        password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || "password",
        database: process.env.DATABASE_DATABASE || process.env.DB_DATABASE || "marddb",
    };
};
// Create connection pool
exports.pool = promise_1.default.createPool(Object.assign(Object.assign({}, getDatabaseConfig()), { waitForConnections: true, connectionLimit: 10, queueLimit: 0 }));
// Database connection helper
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield exports.pool.getConnection();
        logger_1.default.info(`MySQL Connected: ${getDatabaseConfig().host}:${getDatabaseConfig().port}`);
        connection.release();
    }
    catch (error) {
        logger_1.default.error(`Database connection error: ${error instanceof Error ? error.message : "Unknown error"}`);
        process.exit(1);
    }
});
// Query helper function
const query = (sql, params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [results] = yield exports.pool.execute(sql, params);
        return results;
    }
    catch (error) {
        logger_1.default.error("Database query error:", error);
        throw error;
    }
});
exports.query = query;
// Transaction helper function
const transaction = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield exports.pool.getConnection();
    try {
        yield connection.beginTransaction();
        const result = yield callback(connection);
        yield connection.commit();
        return result;
    }
    catch (error) {
        yield connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.transaction = transaction;
exports.default = connectDB;
