import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

// Construct DATABASE_URL if not provided directly
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // const host = process.env.DATABASE_HOST || "mysql";
  // const port = process.env.DATABASE_PORT || "3306";
  // const username = process.env.DATABASE_USERNAME || "marduser";
  // const password = process.env.DATABASE_PASSWORD || "mardpassword";
  // const database = process.env.DATABASE_DATABASE || "marddb";

  return process.env.DATABASE_URL;
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
    console.log(
      `MySQL Connected via Prisma: ${process.env.DATABASE_HOST || "mysql"}:${
        process.env.DATABASE_PORT || "3306"
      }`
    );
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    process.exit(1);
  }
};

export default connectDB;
