"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itemTransferController_1 = require("../controllers/itemTransferController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/create_transfer", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, itemTransferController_1.itemTransferController.createTransfer);
router.get("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "STOREKEEPER"]), itemTransferController_1.itemTransferController.getAllTransfers);
router.get("/:id", itemTransferController_1.itemTransferController.getTransferById);
// transfer all item from shop to store.
router.post("/shops/:shopId/stores/:storeId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), itemTransferController_1.itemTransferController.transferAllShopItemToStore);
exports.default = router;
