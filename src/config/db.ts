import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

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
export const pool = mysql.createPool({
  ...getDatabaseConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Database connection helper
const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(
      `MySQL Connected: ${getDatabaseConfig().host}:${getDatabaseConfig().port}`
    );
    connection.release();
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
};

// Query helper function
export const query = async (sql: string, params?: any[]): Promise<any> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
};

// Transaction helper function
export const transaction = async (callback: (connection: mysql.PoolConnection) => Promise<any>) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default connectDB;
