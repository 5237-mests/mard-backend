import express from "express";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";
import itemController from "../controllers/itemController";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // const uploadDir = "public/uploads/products";
    // “/home/mardtryj/uploads/products”.
    // Save outside the repo
    const uploadDir = path.join(
      process.env.HOME || "/home/mardtryj",
      "uploads/products"
    );
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router = express.Router();

router.get(
  "/all",
  authenticateToken,
  itemController.getAllItems.bind(itemController)
);

router.get(
  "/:id",
  authenticateToken,
  itemController.getItemById.bind(itemController)
);

// router.post(
//   "/create",
//   authenticateToken,
//   authorizeRole(["ADMIN"]),
//   itemController.createItem.bind(itemController)
// );
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  upload.single("image"), // Add this for image upload
  itemController.createItem.bind(itemController)
);

router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  itemController.updateItem.bind(itemController)
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["ADMIN"]),
  itemController.deleteItem.bind(itemController)
);
export default router;
