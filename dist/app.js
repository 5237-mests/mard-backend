"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const shopRoutes_1 = __importDefault(require("./routes/shopRoutes"));
const transferRoutes_1 = __importDefault(require("./routes/transferRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const db_1 = __importDefault(require("./config/db"));
// import path from "path";
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use(express_1.default.json());
(0, db_1.default)();
// Serve static files from the "public" directory
app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
// API Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/check", healthRoutes_1.default);
app.use("/api/shop", shopRoutes_1.default);
app.use("/api/transfer", transferRoutes_1.default);
app.use("/api/notifications", notificationRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
// Serve the React app for all other routes
app.get("*", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../client/index.html"));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
