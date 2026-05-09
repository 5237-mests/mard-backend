import { Router } from "express";
import { liveBalancePivot, liveBalancePivot2 } from "../controllers/liveBalance";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/balance/live.
 * Query:
 *   search=cement
 */
router.get("/live", authenticateToken, liveBalancePivot);
router.get("/live2", liveBalancePivot2);

export default router;
