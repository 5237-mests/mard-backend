"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const itemTransferController_1 = require("../controllers/itemTransferController");
const router = (0, express_1.Router)();
router.post("/", itemTransferController_1.itemTransferController.createTransfer);
router.get("/", itemTransferController_1.itemTransferController.getAllTransfers);
router.get("/:id", itemTransferController_1.itemTransferController.getTransferById);
exports.default = router;
