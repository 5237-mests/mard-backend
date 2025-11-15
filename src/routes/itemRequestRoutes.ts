// import { Router } from "express";
// import { itemRequestController } from "../controllers/itemRequestController";
// import {
//   authenticateToken,
//   authorizeRole,
//   authorizeUser,
// } from "../middleware/authMiddleware";

// const router = Router();

// // shopkeeper creates a request
// router.post(
//   "/",
//   authenticateToken,
//   authorizeUser,
//   itemRequestController.createRequest
// );

// // list / query requests (admin/storekeeper/shopkeeper)
// router.get("/", authenticateToken, itemRequestController.listRequests);
// router.get("/:id", authenticateToken, itemRequestController.getRequest);

// // edit request (only pending)
// router.patch("/:id", authenticateToken, itemRequestController.updateRequest);

// // approve (only ADMIN/STOREKEEPER) -> creates transfer
// router.post(
//   "/:id/approve",
//   authenticateToken,
//   authorizeRole(["ADMIN", "STOREKEEPER"]),
//   itemRequestController.approveRequest
// );

// // remove item from request
// router.delete(
//   "/:id/:item_id",
//   authenticateToken,
//   itemRequestController.removeItemFromRequest
// );

// // reject (only ADMIN/STOREKEEPER)
// router.post(
//   "/:id/reject",
//   authenticateToken,
//   authorizeRole(["ADMIN", "STOREKEEPER"]),
//   itemRequestController.rejectRequest
// );

// export default router;

import { Router } from "express";
import { itemRequestController } from "../controllers/itemRequestController";
import {
  authenticateToken,
  authorizeRole,
  authorizeUser,
} from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeUser,
  itemRequestController.createRequest
);
router.get("/", authenticateToken, itemRequestController.listRequests);
router.get("/:id", authenticateToken, itemRequestController.getRequest);
router.patch("/:id", authenticateToken, itemRequestController.updateRequest);
router.patch(
  "/:id/items",
  authenticateToken,
  itemRequestController.updateItems
);
router.delete(
  "/:id/items/:item_id",
  authenticateToken,
  itemRequestController.removeItemFromRequest
);
router.post(
  "/:id/approve",
  authenticateToken,
  authorizeRole(["ADMIN", "STOREKEEPER"]),
  itemRequestController.approveRequest
);
router.post(
  "/:id/reject",
  authenticateToken,
  authorizeRole(["ADMIN", "STOREKEEPER"]),
  itemRequestController.rejectRequest
);

export default router;
