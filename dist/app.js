"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// import cors from "cors";
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./config/logger"));
const errorHandler_1 = __importDefault(require("./lib/errorHandler"));
// --- Import routes ---
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const storeRoute_1 = __importDefault(require("./routes/storeRoute"));
const transferRoutes_1 = __importDefault(require("./routes/transferRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const brandRoutes_1 = __importDefault(require("./routes/brandRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const itemRoutes_1 = __importDefault(require("./routes/itemRoutes"));
const shopItemRoute_1 = __importDefault(require("./routes/shopItemRoute"));
const ShopShopkeeperRoute_1 = __importDefault(require("./routes/ShopShopkeeperRoute"));
const salesRoute_1 = __importDefault(require("./routes/salesRoute"));
const retailerRoutes_1 = __importDefault(require("./routes/retailerRoutes"));
const factoryAgentRoutes_1 = __importDefault(require("./routes/factoryAgentRoutes"));
const cartRoute_1 = __importDefault(require("./routes/cartRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const salesRoutes2_1 = __importDefault(require("./routes/salesRoutes2"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// --- Middleware ---
app.use(express_1.default.json());
// --- CORS configuration ---
// const corsOptions = {
//   origin: "http://localhost:8080",
//   credentials: true,
// };
// app.use(cors(corsOptions));
// --- Static files (Vite build) ---
const clientBuildPath = path_1.default.join(__dirname, "../client/dist");
app.use(express_1.default.static(clientBuildPath, {
    maxAge: "1h", // Cache assets for 1 hour
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
            // Always serve HTML fresh
            res.setHeader("Cache-Control", "no-cache");
        }
    },
}));
// --- Serve uploads ---
app.use("/uploads", express_1.default.static(path_1.default.join(process.env.HOME || "/home/mardtryj", "uploads/products")));
// --- API Routes ---
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/brands", brandRoutes_1.default);
app.use("/api/category", categoryRoutes_1.default);
app.use("/api/items", itemRoutes_1.default);
app.use("/api/shop_items", shopItemRoute_1.default);
app.use("/api/shop-shopkeepers", ShopShopkeeperRoute_1.default);
app.use("/api/check", healthRoutes_1.default);
app.use("/api/shop", shopRoutes_1.default);
app.use("/api/store", storeRoute_1.default);
app.use("/api/transfer", transferRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
app.use("/api", salesRoute_1.default);
app.use("/api", retailerRoutes_1.default);
app.use("/api", factoryAgentRoutes_1.default);
app.use("/api/cart", cartRoute_1.default);
app.use("/api/orders", orderRoute_1.default);
app.use("/api/sales2", salesRoutes2_1.default);
app.use("/api/payment", paymentRoutes_1.default);
// --- Catch-all route for React SPA ---
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(clientBuildPath, "index.html"));
});
// --- Global error handler ---
app.use(errorHandler_1.default);
// --- Start server ---
app.listen(PORT, () => {
    logger_1.default.info(`✅ Server running on http://localhost:${PORT}`);
});
