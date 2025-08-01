import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_DATABASE || "marddb",
  synchronize: true, // Set to false in production
  logging: false,
  entities: [
    __dirname + "/../models/*.{ts,js}"
  ],
  migrations: [
    "src/migrations/*.ts"
  ],
});

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(`MySQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
