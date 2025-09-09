"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/factoryAgentRoutes.ts
const express_1 = require("express");
const factoryAgentController_1 = __importDefault(require("../controllers/factoryAgentController"));
const router = (0, express_1.Router)();
router.get("/shop_items/:shop_id/items", factoryAgentController_1.default.getShopStock);
router.post("/requests/new-product", factoryAgentController_1.default.createNewProductRequest);
router.post("/requests/repurchase", factoryAgentController_1.default.createRepurchaseRequest);
router.get("/requests", factoryAgentController_1.default.getRequests);
exports.default = router;
