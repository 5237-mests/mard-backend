"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fixedAsset_1 = require("../controllers/fixedAsset");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
/**
 * POST /api/fixed-assets
 */
router.post("/", authMiddleware_1.authenticateToken, authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), fixedAsset_1.createFixedAsset);
/**
 * GET /api/fixed-assets?search=laptop
 */
router.get("/", authMiddleware_1.authenticateToken, fixedAsset_1.getFixedAssets);
/**
 * PUT /api/fixed-assets/:id
 */
router.put("/:id", authMiddleware_1.authenticateToken, fixedAsset_1.updateFixedAsset);
/**
 * DELETE /api/fixed-assets/:id
 */
router.delete("/:id", authMiddleware_1.authenticateToken, fixedAsset_1.deleteFixedAsset);
exports.default = router;
