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
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const itemController_1 = __importDefault(require("../controllers/itemController"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        // const uploadDir = "public/uploads/products";
        // “/home/mardtryj/uploads/products”.
        // Save outside the repo.
        const uploadDir = path_1.default.join(process.env.HOME || "/home/mardtryj", "uploads/products");
        try {
            yield promises_1.default.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        }
        catch (err) {
            cb(err, uploadDir);
        }
    }),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});
const router = express_1.default.Router();
router.get("/all", authMiddleware_1.authenticateToken, itemController_1.default.getAllItems.bind(itemController_1.default));
router.get("/:id", authMiddleware_1.authenticateToken, itemController_1.default.getItemById.bind(itemController_1.default));
// router.post(
//   "/create",
//   authenticateToken,
//   authorizeRole(["ADMIN"]),
//   itemController.createItem.bind(itemController)
// );
router.post("/create", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), upload.single("image"), // Add this for image upload
itemController_1.default.createItem.bind(itemController_1.default));
router.put("/update/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), itemController_1.default.updateItem.bind(itemController_1.default));
router.delete("/delete/:id", authMiddleware_1.authenticateToken, (0, authMiddleware_1.authorizeRole)(["ADMIN"]), itemController_1.default.deleteItem.bind(itemController_1.default));
exports.default = router;
