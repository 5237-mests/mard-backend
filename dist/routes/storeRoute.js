"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const router = (0, express_1.Router)();
// Route to create a new Store
router.post("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), storeController_1.StoreController.createStore);
// Route to get all Stores
router.get("/", authMiddleware_1.authenticateToken, storeController_1.StoreController.getStores);
// Route to get a single Store by ID
router.get("/:id", authMiddleware_1.authenticateToken, storeController_1.StoreController.getStoreById);
// Route to update a Store by ID
router.put("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), storeController_1.StoreController.updateStore);
// Route to delete a Store by ID
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), storeController_1.StoreController.deleteStore);
exports.default = router;
