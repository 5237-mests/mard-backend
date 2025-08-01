"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopItem = void 0;
const typeorm_1 = require("typeorm");
const Shop_1 = __importDefault(require("./Shop"));
const Item_1 = __importDefault(require("./Item"));
let ShopItem = class ShopItem {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ShopItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Shop_1.default),
    (0, typeorm_1.JoinColumn)({ name: "shop_id" }),
    __metadata("design:type", Shop_1.default)
], ShopItem.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Item_1.default),
    (0, typeorm_1.JoinColumn)({ name: "item_id" }),
    __metadata("design:type", Item_1.default)
], ShopItem.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int" }),
    __metadata("design:type", Number)
], ShopItem.prototype, "quantity", void 0);
ShopItem = __decorate([
    (0, typeorm_1.Entity)("shop_items")
], ShopItem);
exports.ShopItem = ShopItem;
exports.default = ShopItem;
