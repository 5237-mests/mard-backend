import logger from "../config/logger";

export interface QueryLogData {
  sql: string;
  params: any[] | undefined;
  executionTime: number;
  timestamp: string;
  userId?: string;
  userRole?: string;
  endpoint?: string;
}

export const dbLogger = {
  // Log query start
  logQueryStart: (
    sql: string,
    params: any[] | undefined,
    userId?: string,
    userRole?: string,
    endpoint?: string
  ) => {
    logger.debug("Database Query Start", {
      sql: sql.substring(0, 200) + (sql.length > 200 ? "..." : ""),
      params: params && params.length > 0 ? params : undefined,
      userId,
      userRole,
      endpoint,
      timestamp: new Date().toISOString(),
    });
  },

  // Log query completion
  logQueryComplete: (
    sql: string,
    params: any[] | undefined,
    executionTime: number,
    userId?: string,
    userRole?: string,
    endpoint?: string
  ) => {
    const logData: QueryLogData = {
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
      logger.warn("Slow Database Query", logData);
    } else {
      logger.debug("Database Query Complete", logData);
    }
  },

  // Log query error
  logQueryError: (
    sql: string,
    params: any[],
    error: Error,
    executionTime: number,
    userId?: string,
    userRole?: string,
    endpoint?: string
  ) => {
    logger.error("Database Query Error", {
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
  logTransactionStart: (
    userId?: string,
    userRole?: string,
    endpoint?: string
  ) => {
    logger.info("Database Transaction Start", {
      userId,
      userRole,
      endpoint,
      timestamp: new Date().toISOString(),
    });
  },

  // Log transaction commit
  logTransactionCommit: (
    userId?: string,
    userRole?: string,
    endpoint?: string
  ) => {
    logger.info("Database Transaction Commit", {
      userId,
      userRole,
      endpoint,
      timestamp: new Date().toISOString(),
    });
  },

  // Log transaction rollback
  logTransactionRollback: (
    error: Error,
    userId?: string,
    userRole?: string,
    endpoint?: string
  ) => {
    logger.error("Database Transaction Rollback", {
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
export const withDbLogging = async <T>(
  operation: () => Promise<T>,
  sql: string,
  params: any[],
  userId?: string,
  userRole?: string,
  endpoint?: string
): Promise<T> => {
  const startTime = Date.now();

  try {
    dbLogger.logQueryStart(sql, params, userId, userRole, endpoint);
    const result = await operation();
    const executionTime = Date.now() - startTime;
    dbLogger.logQueryComplete(
      sql,
      params,
      executionTime,
      userId,
      userRole,
      endpoint
    );
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    dbLogger.logQueryError(
      sql,
      params,
      error as Error,
      executionTime,
      userId,
      userRole,
      endpoint
    );
    throw error;
  }
};
