import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Construct DATABASE_URL if not provided directly
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  const host = process.env.DB_HOST || "localhost";
  const port = process.env.DB_PORT || "3306";
  const username = process.env.DB_USERNAME || "root";
  const password = process.env.DB_PASSWORD || "password";
  const database = process.env.DB_DATABASE || "marddb";
  
  return `mysql://${username}:${password}@${host}:${port}/${database}`;
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(`MySQL Connected via Prisma: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

export default connectDB;
