import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import healthRoutes from "./routes/healthRoutes";
import shopRoutes from "./routes/shopRoutes";
import transferRoutes from "./routes/transferRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import brandroutes from "./routes/brandRoutes";
import connectDB from "./config/db";

import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

connectDB();

// CORS configuration
const corsOptions = {
  origin: "http://localhost:8080",
  credentials: true,
};
app.use(cors(corsOptions));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../client")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/brands", brandroutes);
app.use("/api/check", healthRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/inventory", inventoryRoutes);

// Serve the React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
