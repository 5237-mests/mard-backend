import { Router } from "express";
import { storeReceiveController } from "../controllers/storeReceiveController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";

const router = Router();

// create receive (RECEIVER or ADMIN)
router.post(
  "/",
  authenticateToken,
  authorizeUser,
  authorizeRole(["RECEIVER", "ADMIN"]),
  storeReceiveController.createReceive
);

// add items to receive (RECEIVER or ADMIN)
router.post(
  "/:id/items",
  authenticateToken,
  authorizeUser,
  authorizeRole(["RECEIVER", "ADMIN"]),
  storeReceiveController.addItems
);

// edit receive (only pending) - RECEIVER or ADMIN
// router.patch(
//   "/:id",
//   authenticateToken,
//   authorizeUser,
//   authorizeRole(["RECEIVER", "ADMIN"]),
//   storeReceiveController.updateReceive
// );

// updateReceiveItems
router.patch(
  "/:id",
  authenticateToken,
  authorizeRole(["RECEIVER", "ADMIN"]),
  storeReceiveController.updateReceiveItems
);

// update/delete individual receive item (only pending) - RECEIVER or ADMIN
router.patch(
  "/items/:itemId",
  authenticateToken,
  authorizeUser,
  authorizeRole(["RECEIVER", "ADMIN"]),
  storeReceiveController.updateReceiveItem
);

// delete individual receive item (only pending) - RECEIVER or ADMIN
router.delete(
  "/:id/items/:itemId",
  authenticateToken,
  authorizeRole(["RECEIVER", "ADMIN"]),
  storeReceiveController.deleteReceiveItem
);

// list & get (STOREKEEPER, RECEIVER, ADMIN)
router.get(
  "/",
  authenticateToken,
  authorizeRole(["STOREKEEPER", "RECEIVER", "ADMIN"]),
  storeReceiveController.listReceives
);

// get receive by id (STOREKEEPER, RECEIVER, ADMIN)
router.get(
  "/:id",
  authenticateToken,
  authorizeRole(["STOREKEEPER", "RECEIVER", "ADMIN"]),
  storeReceiveController.getReceiveById
);

// approve (STOREKEEPER or ADMIN)
router.post(
  "/:id/approve",
  authenticateToken,
  authorizeUser,
  authorizeRole(["STOREKEEPER", "ADMIN"]),
  storeReceiveController.approveReceive
);
// reject receive (STOREKEEPER or ADMIN)
router.post(
  "/:id/reject",
  authenticateToken,
  authorizeUser,
  authorizeRole(["STOREKEEPER", "ADMIN"]),
  storeReceiveController.rejectReceive
);

// delete receive (only pending) - ADMIN or RECEIVER
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["ADMIN", "RECEIVER"]),
  storeReceiveController.deleteReceive
);

export default router;
