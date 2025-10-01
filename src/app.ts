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
// import adminRoutes from "./routes/adminRoutes";
import retailerRoutes from "./routes/retailerRoutes";
import factoryAgentRoutes from "./routes/factoryAgentRoutes";
import connectDB from "./config/db";
import logger from "./config/logger";
import cartRoutes from "./routes/cartRoute";
import orderRoutes from "./routes/orderRoute";
import salesroutes2 from "./routes/salesRoutes2";
import path from "path";

// import { logStream } from "./config/logger";
// import {
// apiLogger,
// errorLogger,
// performanceLogger,
// } from "./middleware/apiLogger";

import errorHandler from "./lib/errorHandler";

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

// app.use("/uploads", express.static("public/uploads"));
// Serve uploads via /uploads URL.
app.use(
  "/uploads",
  express.static(
    path.join(process.env.HOME || "/home/mardtryj", "uploads/products")
  )
);

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
app.use("/api", retailerRoutes);
app.use("/api", factoryAgentRoutes);
// app.use("/api/order", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales2", salesroutes2);

// Error logging middleware (must be after all routes)
// app.use(errorLogger);

// Global error handler (must be last)
app.use(errorHandler);

// Serve the React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
