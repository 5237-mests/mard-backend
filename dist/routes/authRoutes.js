"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const router = express_1.default.Router();
// User registration route
router.post("/register", authController_1.default.register);
router.get("/verify-email", authController_1.default.verifyEmail);
// User login route (returns JWT only)
router.post("/login", authController_1.default.login);
// User logout route (for JWT, this is a client-side operation)
router.post("/logout", authController_1.default.logout);
exports.default = router;
