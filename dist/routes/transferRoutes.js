"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const roleMiddleware_1 = require("../middleware/roleMiddleware");
const transferController_1 = require("../controllers/transferController");
const router = express_1.default.Router();
// List and filter transfer requests
router.get("/list", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["admin", "storekeeper", "shopkeeper"]), transferController_1.listTransferRequests);
// Admin/storekeeper direct transfer
router.post("/admin-transfer", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["admin", "storekeeper"]), transferController_1.adminTransfer);
// Shopkeeper requests transfer to store or another shop
router.post("/request", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["shopkeeper"]), transferController_1.requestStockTransfer);
// Approve a transfer request
router.post("/approve", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["admin", "storekeeper", "shopkeeper"]), transferController_1.approveTransferRequest);
// Reject a transfer request
router.post("/reject", authMiddleware_1.default, (0, roleMiddleware_1.roleMiddleware)(["admin", "storekeeper", "shopkeeper"]), transferController_1.rejectTransferRequest);
exports.default = router;
