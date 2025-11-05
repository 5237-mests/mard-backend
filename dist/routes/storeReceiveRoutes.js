"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeReceiveController_1 = require("../controllers/storeReceiveController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// create receive (RECEIVER or ADMIN)
router.post("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.createReceive);
// add items to receive (RECEIVER or ADMIN)
router.post("/:id/items", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.addItems);
// edit receive (only pending) - RECEIVER or ADMIN
router.patch("/:id", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.updateReceive);
// update/delete individual receive item (only pending) - RECEIVER or ADMIN
router.patch("/items/:itemId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.updateReceiveItem);
router.delete("/items/:itemId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.deleteReceiveItem);
// list & get (STOREKEEPER, RECEIVER, ADMIN)
router.get("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.listReceives);
router.get("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.getReceiveById);
// approve / reject (STOREKEEPER or ADMIN)
router.post("/:id/approve", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "ADMIN"]), storeReceiveController_1.storeReceiveController.approveReceive);
router.post("/:id/reject", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "ADMIN"]), storeReceiveController_1.storeReceiveController.rejectReceive);
// delete receive (only pending) - ADMIN or RECEIVER
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RECEIVER"]), storeReceiveController_1.storeReceiveController.deleteReceive);
exports.default = router;
