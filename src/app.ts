import express from "express";
import dotenv from "dotenv";
import path from "path";
// import cors from "cors";
import connectDB from "./config/db";
import logger from "./config/logger";
import errorHandler from "./lib/errorHandler";

// --- Import routes ---
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
import retailerRoutes from "./routes/retailerRoutes";
import factoryAgentRoutes from "./routes/factoryAgentRoutes";
import cartRoutes from "./routes/cartRoute";
import orderRoutes from "./routes/orderRoute";
import salesroutes2 from "./routes/salesRoutes2";
import paymentRoutes from "./routes/paymentRoutes";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(express.json());

// --- CORS configuration ---
// const corsOptions = {
//   origin: "http://localhost:8080",
//   credentials: true,
// };
// app.use(cors(corsOptions));

// --- Static files (Vite build) ---
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(
  express.static(clientBuildPath, {
    maxAge: "1h", // Cache assets for 1 hour
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        // Always serve HTML fresh
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// --- Serve uploads ---
app.use(
  "/uploads",
  express.static(
    path.join(process.env.HOME || "/home/mardtryj", "uploads/products")
  )
);

// --- API Routes ---
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
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sales2", salesroutes2);
app.use("/api/payment", paymentRoutes);

// --- Catch-all route for React SPA ---
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// --- Global error handler ---
app.use(errorHandler);

// --- Start server ---
app.listen(PORT, () => {
  logger.info(`✅ Server running on http://localhost:${PORT}`);
});
