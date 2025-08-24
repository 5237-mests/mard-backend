"use strict";
// Manual type definitions for database entities
// These replace the previous Prisma-generated types
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferRequestStatus = exports.Role = void 0;
// Enums
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["SHOPKEEPER"] = "SHOPKEEPER";
    Role["STOREKEEPER"] = "STOREKEEPER";
    Role["USER"] = "USER";
})(Role || (exports.Role = Role = {}));
var TransferRequestStatus;
(function (TransferRequestStatus) {
    TransferRequestStatus["PENDING"] = "PENDING";
    TransferRequestStatus["APPROVED"] = "APPROVED";
    TransferRequestStatus["REJECTED"] = "REJECTED";
})(TransferRequestStatus || (exports.TransferRequestStatus = TransferRequestStatus = {}));
// export interface Sale {
//   id: number;
//   shop_id: string;
//   sold_by_id: number;
//   total_amount: number;
//   customer_name: string | null;
//   customer_contact: string | null;
//   created_at: string;
//   items: SaleItem[];
// }
