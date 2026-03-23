import { Router } from "express";
import {
  createFixedAsset,
  getFixedAssets,
  updateFixedAsset,
  deleteFixedAsset,
} from "../controllers/fixedAsset";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

/**
 * POST /api/fixed-assets
 */
router.post("/", authenticateToken, createFixedAsset);

/**
 * GET /api/fixed-assets?search=laptop
 */
router.get("/", authenticateToken, getFixedAssets);

/**
 * PUT /api/fixed-assets/:id
 */
router.put("/:id", authenticateToken, updateFixedAsset);

/**
 * DELETE /api/fixed-assets/:id
 */
router.delete("/:id", authenticateToken, deleteFixedAsset);

export default router;
