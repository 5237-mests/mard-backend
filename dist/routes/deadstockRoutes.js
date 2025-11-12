"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deadstockController_1 = require("../controllers/deadstockController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// report deadstock (authenticated)
router.post("/", authMiddleware_1.authenticateToken, authMiddleware_1.authorizeUser, deadstockController_1.deadstockController.report);
// list (authenticated+role)
router.get("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "STOREKEEPER", "SHOPKEEPER"]), deadstockController_1.deadstockController.list);
// get one
router.get("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN", "STOREKEEPER", "SHOPKEEPER"]), deadstockController_1.deadstockController.getById);
// resolve / discard
router.patch("/:id/resolve", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), deadstockController_1.deadstockController.resolve);
// delete (admin)
router.delete("/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), deadstockController_1.deadstockController.remove);
exports.default = router;
