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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../config/db");
const user_1 = __importDefault(require("../models/user"));
class UserService {
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            const user = userRepository.create(userData);
            return yield userRepository.save(user);
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            return yield userRepository.findOne({ where: { email } });
        });
    }
    updateUserRole(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            yield userRepository.update({ id: parseInt(userId) }, { role });
            return yield userRepository.findOne({ where: { id: parseInt(userId) } });
        });
    }
    getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Fetching all users from the database");
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            // Log the number of users in the database
            const users = yield userRepository.find({});
            console.log("Total users in database:", users.length);
            // Return the list of users
            console.log("Returning all users:", users);
            if (users.length === 0) {
                console.log("No users found in the database");
                return [];
            }
            return users;
        });
    }
    getUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = db_1.AppDataSource.getRepository(user_1.default);
            return yield userRepository.findOne({ where: { id: parseInt(userId) } });
        });
    }
}
exports.UserService = UserService;
