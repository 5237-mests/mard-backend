"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// File: src/routes/storestorekeeperRoute.ts
// This file defines the API routes for the store_storekeepers relationship.
const express_1 = require("express");
// import { storestorekeeperController } from "../controllers/storestorekeeperController";
const StoreStorekeeperController_1 = require("../controllers/StoreStorekeeperController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Route to add a storekeeper to a store
router.post("/stores/:storeId/storekeepers/:userId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), StoreStorekeeperController_1.storestorekeeperController.addstorekeeperTostore);
// Route to get all storekeepers for a specific store
router.get("/stores/:storeId/storekeepers", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), StoreStorekeeperController_1.storestorekeeperController.getstorekeepersBystoreId);
// Route to get all stores for a specific storekeeper
router.get("/storekeepers/:userId/stores", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), StoreStorekeeperController_1.storestorekeeperController.getstoresBystorekeeperId);
// Route to remove a storekeeper from a store
router.delete("/stores/:storeId/storekeepers/:userId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), StoreStorekeeperController_1.storestorekeeperController.removestorekeeperFromstore);
exports.default = router;
