import { Router } from "express";
import { liveBalancePivot } from "../controllers/liveBalance";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/balance/live.
 * Query:
 *   search=cement
 */
router.get("/live", authenticateToken, liveBalancePivot);

export default router;
