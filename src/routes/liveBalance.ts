import { Router } from "express";
// import { getLiveBalance } from "../controllers/liveBalance";
import { liveBalancePivot } from "../controllers/liveBalance";

const router = Router();

/**
 * GET /api/balance/live
 * Query:
 *   shop_id=1
 *   store_id=1
 *   search=cement
 */
router.get("/live", liveBalancePivot);

export default router;
