import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import UserController from "../controllers/userController";

const router = express.Router();
const userController = new UserController();

// Route to get all users
router.get(
  "/all",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  userController.listAllUsers.bind(userController)
);

// Route to update a user's role (only admin can do this)
router.put(
  "/role/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  userController.updateUserRole.bind(userController)
);

// Route to get current user information
router.get(
  "/me/:id",
  authenticateToken,
  userController.getUserDetails.bind(userController)
);

// Route to update user profile
router.put(
  "/profile/:id",
  authenticateToken,
  userController.updateUserProfile.bind(userController)
);

// Route to update user password
router.put(
  "/password/:id",
  authenticateToken,
  userController.updateUserPassword.bind(userController)
);

export default router;
