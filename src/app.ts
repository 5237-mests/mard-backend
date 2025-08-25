import express from "express";
import dotenv from "dotenv";
// import cors from "cors";
// import morgan from "morgan";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import healthRoutes from "./routes/healthRoutes";
import shopRoutes from "./routes/shopRoutes";
import storeRoutes from "./routes/storeRoute";
import transferRoutes from "./routes/transferRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import brandroutes from "./routes/brandRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import itemRoutes from "./routes/itemRoutes";
import shopItemRoutes from "./routes/shopItemRoute";
import shopShopKeeperRoutes from "./routes/ShopShopkeeperRoute";
import salesRoutes from "./routes/salesRoute";
import connectDB from "./config/db";
import logger from "./config/logger";
// import { logStream } from "./config/logger";
// import {
// apiLogger,
// errorLogger,
// performanceLogger,
// } from "./middleware/apiLogger";

import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

connectDB();

// CORS configuration
// const corsOptions = {
//   origin: "http://localhost:8080",
//   credentials: true,
// };
// app.use(cors(corsOptions));

// Logging middleware
// app.use(morgan("combined", { stream: logStream }));
// app.use(apiLogger);
// app.use(performanceLogger);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../client")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/brands", brandroutes);
app.use("/api/category", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/shop_items", shopItemRoutes);
app.use("/api/shop-shopkeepers", shopShopKeeperRoutes);
app.use("/api/check", healthRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api", salesRoutes);

// Error logging middleware (must be after all routes)
// app.use(errorLogger);

// Serve the React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
