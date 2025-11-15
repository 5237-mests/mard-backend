"use strict";
// import { Router } from "express";
// import { itemRequestController } from "../controllers/itemRequestController";
// import {
//   authenticateToken,
//   authorizeRole,
//   authorizeUser,
// } from "../middleware/authMiddleware";
Object.defineProperty(exports, "__esModule", { value: true });
// const router = Router();
// // shopkeeper creates a request
// router.post(
//   "/",
//   authenticateToken,
//   authorizeUser,
//   itemRequestController.createRequest
// );
// // list / query requests (admin/storekeeper/shopkeeper)
// router.get("/", authenticateToken, itemRequestController.listRequests);
// router.get("/:id", authenticateToken, itemRequestController.getRequest);
// // edit request (only pending)
// router.patch("/:id", authenticateToken, itemRequestController.updateRequest);
// // approve (only ADMIN/STOREKEEPER) -> creates transfer
// router.post(
//   "/:id/approve",
//   authenticateToken,
//   authorizeRole(["ADMIN", "STOREKEEPER"]),
//   itemRequestController.approveRequest
// );
// // remove item from request
// router.delete(
//   "/:id/:item_id",
//   authenticateToken,
//   itemRequestController.removeItemFromRequest
// );
// // reject (only ADMIN/STOREKEEPER)
// router.post(
//   "/:id/reject",
//   authenticateToken,
//   authorizeRole(["ADMIN", "STOREKEEPER"]),
//   itemRequestController.rejectRequest
// );
// export default router;
const express_1 = require("express");
const itemRequestController_1 = require("../controllers/itemRequestController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, itemRequestController_1.itemRequestController.createRequest);
router.get("/", authMiddleware_1.authenticateToken, itemRequestController_1.itemRequestController.listRequests);
router.get("/:id", authMiddleware_1.authenticateToken, itemRequestController_1.itemRequestController.getRequest);
router.patch("/:id", authMiddleware_1.authenticateToken, itemRequestController_1.itemRequestController.updateRequest);
router.patch("/:id/items", authMiddleware_1.authenticateToken, itemRequestController_1.itemRequestController.updateItems);
router.delete("/:id/items/:item_id", authMiddleware_1.authenticateToken, itemRequestController_1.itemRequestController.removeItemFromRequest);
router.post("/:id/approve", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "STOREKEEPER"]), itemRequestController_1.itemRequestController.approveRequest);
router.post("/:id/reject", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "STOREKEEPER"]), itemRequestController_1.itemRequestController.rejectRequest);
exports.default = router;
