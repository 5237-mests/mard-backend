"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const userService_1 = require("../services/userService");
class UserController {
    constructor() {
        this.userService = new userService_1.UserService();
    }
    getUserDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const user = yield this.userService.getUserById(userId);
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.status(200).json(user);
            }
            catch (error) {
                return res.status(500).json({ message: "Server error", error });
            }
        });
    }
    getUsersByRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { role } = req.query;
                if (!role) {
                    return res.status(400).json({
                        message: "Invalid role parameter. Only shopkeeper or storekeeper is supported.'",
                    });
                }
                if (role === "shopkeeper") {
                    const shopkeepers = yield this.userService.getShopkeepers();
                    return res.status(200).json(shopkeepers);
                }
                else if (role === "storekeeper") {
                    const storekeepers = yield this.userService.getStorekeepers();
                    return res.status(200).json(storekeepers);
                }
                else {
                    return res.status(400).json({
                        message: "Invalid role parameter. Only shopkeeper or storekeeper is supported.'",
                    });
                }
            }
            catch (error) { }
        });
    }
    getShopkeepers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { role } = req.query;
                if (role && role !== "shopkeeper") {
                    return res.status(400).json({
                        message: "Invalid role parameter. Only shopkeeper is supported.'",
                    });
                }
                const shopkeepers = yield this.userService.getShopkeepers();
                return res.status(200).json(shopkeepers);
            }
            catch (error) {
                return res.status(500).json({ message: "Server error", error });
            }
        });
    }
    updateUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { role } = req.body;
                const updatedUser = yield this.userService.updateUserRole(userId, role);
                if (!updatedUser) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.status(200).json(updatedUser);
            }
            catch (error) {
                return res.status(500).json({ message: "Server error", error });
            }
        });
    }
    updateUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { name, email, phone } = req.body;
                const updatedUser = yield this.userService.updateUserProfile(userId, {
                    name,
                    email,
                    phone,
                });
                return res.status(200).json(updatedUser);
            }
            catch (error) {
                return res.status(500).json({ message: "Server error", error });
            }
        });
    }
    updateUserPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const { newPassword } = req.body;
                const updatedUser = yield this.userService.updateUserPassword(userId, newPassword);
                if (!updatedUser) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.status(200).json(updatedUser);
            }
            catch (error) {
                return res.status(500).json({ message: "Server error", error });
            }
        });
    }
    listAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userService.getAllUsers();
                return res.status(200).json(users);
            }
            catch (error) {
                console.error("Error in listAllUsers:", error);
                if (error instanceof Error) {
                    console.error("Error stack:", error.stack);
                }
                return res
                    .status(500)
                    .json({ message: "Server error *** from controller", error });
            }
        });
    }
    // Delete user
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.id;
                const deletedUser = yield this.userService.deleteUser(userId);
                if (!deletedUser) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.status(200).json({ message: "User deleted successfully" });
            }
            catch (error) {
                return res.status(500).json({ message: "Server error", error });
            }
        });
    }
}
exports.default = UserController;
