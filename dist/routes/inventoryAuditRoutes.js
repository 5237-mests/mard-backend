"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryAuditController_1 = require("../controllers/inventoryAuditController");
const authMiddleware_1 = require("../middleware/authMiddleware"); // if you want to protect
const router = (0, express_1.Router)();
/**
 * POST /api/inventory-audit
 * Create a new audit record.
 * Body: {
 *   location_type: 'store' | 'shop',
 *   location_id: number,
 *   item_id: number,
 *   txn_type: 'receive' | 'transfer_out' | 'transfer_in' | 'sale' | 'wastage',
 *   quantity_in?: number,
 *   quantity_out?: number,
 *   reference_id?: number,
 *   reference_table?: string,
 *   note?: string
 * }
 */
router.post("/", authMiddleware_1.authenticateToken, inventoryAuditController_1.inventoryAuditController.createAudit);
/**
 * GET /api/inventory-audit
 * List audit records (filter by location, item, txn_type).
 * Query params: location_type, location_id, item_id, txn_type
 * Returns: Array of audit records, most recent first.
 */
router.get("/", authMiddleware_1.authenticateToken, inventoryAuditController_1.inventoryAuditController.listAudits);
/**
 * GET /api/inventory-audit/:id
 * Get details for a specific audit record.
 */
router.get("/:id", authMiddleware_1.authenticateToken, inventoryAuditController_1.inventoryAuditController.getAudit);
exports.default = router;
