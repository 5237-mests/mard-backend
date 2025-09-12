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
/**
 * Build DB config (supports DATABASE_URL or individual env vars).
 */
const getDatabaseConfig = () => {
    if (process.env.DATABASE_URL) {
        // Format: mysql://username:password@host:port/database
        const url = new URL(process.env.DATABASE_URL);
        return {
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: url.password,
            database: url.pathname.slice(1), // strip leading "/"
        };
    }
    return {
        host: process.env.DATABASE_HOST || process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || "3306"),
        user: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || "root",
        password: process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || "password",
        database: process.env.DATABASE_DATABASE || process.env.DB_DATABASE || "marddb",
    };
};
/**
 * Create a connection pool
 */
exports.pool = promise_1.default.createPool(Object.assign(Object.assign({}, getDatabaseConfig()), { waitForConnections: true, connectionLimit: 10, queueLimit: 0 }));
/**
 * DB connection tester with retries (for app startup).
 */
const connectDB = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (retries = 3, delay = 3000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const connection = yield exports.pool.getConnection();
            logger_1.default.info(`MySQL Connected: ${getDatabaseConfig().host}:${getDatabaseConfig().port}`);
            connection.release();
            return;
        }
        catch (error) {
            logger_1.default.error(`DB connection attempt ${attempt} failed: ${error instanceof Error ? error.message : "Unknown error"}`);
            if (attempt === retries) {
                logger_1.default.error("Max retries reached. Exiting...");
                process.exit(1);
            }
            yield new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
});
/**
 * Run a simple query (no transaction).
 */
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
/**
 * Transaction helper — safely handles rollback & release.
 */
const transaction = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const connection = yield exports.pool.getConnection();
    try {
        yield connection.beginTransaction();
        const result = yield callback(connection);
        yield connection.commit();
        return result;
    }
    catch (error) {
        try {
            // rollback only if connection is still open
            if ((_b = (_a = connection.connection) === null || _a === void 0 ? void 0 : _a.stream) === null || _b === void 0 ? void 0 : _b.writable) {
                yield connection.rollback();
            }
        }
        catch (rollbackError) {
            logger_1.default.error("Rollback failed:", rollbackError);
        }
        throw error;
    }
    finally {
        connection.release();
    }
});
exports.transaction = transaction;
exports.default = connectDB;
// import mysql from "mysql2/promise";
// import dotenv from "dotenv";
// import logger from "./logger";
// dotenv.config();
// // Construct DATABASE_URL if not provided directly
// const getDatabaseConfig = () => {
//   if (process.env.DATABASE_URL) {
//     // Parse DATABASE_URL format: mysql://username:password@host:port/database
//     const url = new URL(process.env.DATABASE_URL);
//     return {
//       host: url.hostname,
//       port: parseInt(url.port) || 3306,
//       user: url.username,
//       password: url.password,
//       database: url.pathname.slice(1), // Remove leading slash
//     };
//   }
//   return {
//     host: process.env.DATABASE_HOST || process.env.DB_HOST || "mysql",
//     port: parseInt(process.env.DATABASE_PORT || process.env.DB_PORT || "3306"),
//     user: process.env.DATABASE_USERNAME || process.env.DB_USERNAME || "root",
//     password:
//       process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || "password",
//     database:
//       process.env.DATABASE_DATABASE || process.env.DB_DATABASE || "marddb",
//   };
// };
// // Create connection pool
// export const pool = mysql.createPool({
//   ...getDatabaseConfig(),
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });
// // Database connection helper with retry
// const connectDB = async (retries = 3, delay = 3000): Promise<void> => {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const connection = await pool.getConnection();
//       logger.info(
//         `MySQL Connected: ${getDatabaseConfig().host}:${
//           getDatabaseConfig().port
//         }`
//       );
//       connection.release();
//       return;
//     } catch (error) {
//       logger.error(
//         `Database connection attempt ${attempt} failed: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//       if (attempt === retries) {
//         logger.error("Max retries reached. Exiting...");
//         process.exit(1);
//       }
//       await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//   }
// };
// // Query helper function
// export const query = async <T = any[]>(
//   sql: string,
//   params?: any[]
// ): Promise<T> => {
//   try {
//     const [results] = await pool.execute(sql, params);
//     return results as T;
//   } catch (error) {
//     logger.error("Database query error:", error);
//     throw error;
//   }
// };
// // Transaction helper function
// export const transaction = async <T>(
//   callback: (connection: mysql.PoolConnection) => Promise<T>
// ): Promise<T> => {
//   const connection = await pool.getConnection();
//   try {
//     await connection.beginTransaction();
//     const result = await callback(connection);
//     await connection.commit();
//     return result;
//   } catch (error) {
//     await connection.rollback();
//     throw error;
//   } finally {
//     connection.release();
//   }
// };
// export default connectDB;
// // **********************
