import express from "express";
import AuthController from "../controllers/authController";

const router = express.Router();

// User registration route
router.post("/register", AuthController.register);
router.get("/verify-email", AuthController.verifyEmail);

// User login route (returns JWT only)
router.post("/login", AuthController.login);

// User logout route (for JWT, this is a client-side operation)
router.post("/logout", AuthController.logout);

router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

export default router;
