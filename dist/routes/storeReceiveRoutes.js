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
// router.patch(
//   "/:id",
//   authenticateToken,
//   authorizeUser,
//   authorizeRole(["RECEIVER", "ADMIN"]),
//   storeReceiveController.updateReceive
// );
// updateReceiveItems
router.patch("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.updateReceiveItems);
// update/delete individual receive item (only pending) - RECEIVER or ADMIN
router.patch("/items/:itemId", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.updateReceiveItem);
// delete individual receive item (only pending) - RECEIVER or ADMIN
router.delete("/:id/items/:itemId", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.deleteReceiveItem);
// list & get (STOREKEEPER, RECEIVER, ADMIN)
router.get("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.listReceives);
// get receive by id (STOREKEEPER, RECEIVER, ADMIN)
router.get("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "RECEIVER", "ADMIN"]), storeReceiveController_1.storeReceiveController.getReceiveById);
// approve (STOREKEEPER or ADMIN)
router.post("/:id/approve", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "ADMIN"]), storeReceiveController_1.storeReceiveController.approveReceive);
// reject receive (STOREKEEPER or ADMIN)
router.post("/:id/reject", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, (0, authMiddleware_1.authorizeRole)(["STOREKEEPER", "ADMIN"]), storeReceiveController_1.storeReceiveController.rejectReceive);
// delete receive (only pending) - ADMIN or RECEIVER.
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "RECEIVER"]), storeReceiveController_1.storeReceiveController.deleteReceive);
// delete approved receive
router.delete("/approved/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), storeReceiveController_1.storeReceiveController.deleteApprovedReceive);
exports.default = router;
