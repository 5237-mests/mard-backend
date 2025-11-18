import { Router } from "express";
import { inventoryAuditController } from "../controllers/inventoryAuditController";
import { authenticateToken } from "../middleware/authMiddleware"; // if you want to protect

const router = Router();

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
router.post("/", authenticateToken, inventoryAuditController.createAudit);

/**
 * GET /api/inventory-audit
 * List audit records (filter by location, item, txn_type).
 * Query params: location_type, location_id, item_id, txn_type
 * Returns: Array of audit records, most recent first.
 */
router.get("/", authenticateToken, inventoryAuditController.listAudits);

/**
 * GET /api/inventory-audit/:id
 * Get details for a specific audit record.
 */
router.get("/:id", authenticateToken, inventoryAuditController.getAudit);

export default router;
