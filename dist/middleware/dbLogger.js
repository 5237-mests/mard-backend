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
exports.withDbLogging = exports.dbLogger = void 0;
const logger_1 = __importDefault(require("../config/logger"));
exports.dbLogger = {
    // Log query start
    logQueryStart: (sql, params, userId, userRole, endpoint) => {
        logger_1.default.debug("Database Query Start", {
            sql: sql.substring(0, 200) + (sql.length > 200 ? "..." : ""),
            params: params && params.length > 0 ? params : undefined,
            userId,
            userRole,
            endpoint,
            timestamp: new Date().toISOString(),
        });
    },
    // Log query completion
    logQueryComplete: (sql, params, executionTime, userId, userRole, endpoint) => {
        const logData = {
            sql: sql.substring(0, 200) + (sql.length > 200 ? "..." : ""),
            params: params && params.length > 0 ? params : undefined,
            executionTime,
            timestamp: new Date().toISOString(),
            userId,
            userRole,
            endpoint,
        };
        // Log slow queries as warnings
        if (executionTime > 100) {
            logger_1.default.warn("Slow Database Query", logData);
        }
        else {
            logger_1.default.debug("Database Query Complete", logData);
        }
    },
    // Log query error
    logQueryError: (sql, params, error, executionTime, userId, userRole, endpoint) => {
        logger_1.default.error("Database Query Error", {
            sql: sql.substring(0, 200) + (sql.length > 200 ? "..." : ""),
            params: params.length > 0 ? params : undefined,
            error: error.message,
            stack: error.stack,
            executionTime,
            userId,
            userRole,
            endpoint,
            timestamp: new Date().toISOString(),
        });
    },
    // Log transaction start
    logTransactionStart: (userId, userRole, endpoint) => {
        logger_1.default.info("Database Transaction Start", {
            userId,
            userRole,
            endpoint,
            timestamp: new Date().toISOString(),
        });
    },
    // Log transaction commit
    logTransactionCommit: (userId, userRole, endpoint) => {
        logger_1.default.info("Database Transaction Commit", {
            userId,
            userRole,
            endpoint,
            timestamp: new Date().toISOString(),
        });
    },
    // Log transaction rollback
    logTransactionRollback: (error, userId, userRole, endpoint) => {
        logger_1.default.error("Database Transaction Rollback", {
            error: error.message,
            stack: error.stack,
            userId,
            userRole,
            endpoint,
            timestamp: new Date().toISOString(),
        });
    },
};
// Wrapper function to add logging to database operations
const withDbLogging = (operation, sql, params, userId, userRole, endpoint) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    try {
        exports.dbLogger.logQueryStart(sql, params, userId, userRole, endpoint);
        const result = yield operation();
        const executionTime = Date.now() - startTime;
        exports.dbLogger.logQueryComplete(sql, params, executionTime, userId, userRole, endpoint);
        return result;
    }
    catch (error) {
        const executionTime = Date.now() - startTime;
        exports.dbLogger.logQueryError(sql, params, error, executionTime, userId, userRole, endpoint);
        throw error;
    }
});
exports.withDbLogging = withDbLogging;
