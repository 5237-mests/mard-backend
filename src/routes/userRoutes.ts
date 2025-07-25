import { Router } from "express";
import UserController from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";
import { roleMiddleware } from "../middleware/roleMiddleware";

const router = Router();
const userController = new UserController();

// Route to get user details
router.get(
  "/me",
  authMiddleware,
  userController.getUserDetails.bind(userController)
);

// Route to update user role (admin only)
router.put(
  "/role/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.updateUserRole.bind(userController)
);

// Route to list all users (admin only)
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  userController.listAllUsers.bind(userController)
);

export default router;
