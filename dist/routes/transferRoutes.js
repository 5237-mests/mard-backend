"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authMiddleware_1 = require("../middleware/authMiddleware");
const express_1 = __importDefault(require("express"));
const transferController_1 = require("../controllers/transferController");
const router = express_1.default.Router();
// List all transfer requests (Admin only)
router.get("/", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), transferController_1.listTransferRequests);
// Admin direct transfer (Admin only)
router.post("/admin", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), transferController_1.adminTransfer);
// Request stock transfer (Shopkeeper only)
router.post("/request", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["SHOPKEEPER"]), transferController_1.requestStockTransfer);
// Approve transfer request (Admin only)
router.put("/approve", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), transferController_1.approveTransferRequest);
// Reject transfer request (Admin only)
router.put("/reject", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), transferController_1.rejectTransferRequest);
exports.default = router;
