"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const liveBalance_1 = require("../controllers/liveBalance");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * GET /api/balance/live.
 * Query:
 *   search=cement
 */
router.get("/live", authMiddleware_1.authenticateToken, liveBalance_1.liveBalancePivot);
exports.default = router;
