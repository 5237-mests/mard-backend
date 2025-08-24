"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
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
const db_1 = __importDefault(require("./config/db"));
const logger_1 = __importDefault(require("./config/logger"));
const logger_2 = require("./config/logger");
const apiLogger_1 = require("./middleware/apiLogger");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
(0, db_1.default)();
// CORS configuration
const corsOptions = {
    origin: "http://localhost:8080",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Logging middleware
app.use((0, morgan_1.default)("combined", { stream: logger_2.logStream }));
app.use(apiLogger_1.apiLogger);
app.use(apiLogger_1.performanceLogger);
// Serve static files from the "public" directory
app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
// API Routes
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
// Error logging middleware (must be after all routes)
app.use(apiLogger_1.errorLogger);
// Serve the React app for all other routes
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../client/index.html"));
});
// Start the server
app.listen(PORT, () => {
    logger_1.default.info(`Server is running on http://localhost:${PORT}`);
});
