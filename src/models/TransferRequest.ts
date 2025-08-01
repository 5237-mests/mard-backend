import { TransferRequest as PrismaTransferRequest, ITransferItem, TransferRequestStatus } from "../types/prisma";
import User from "./user";

export { ITransferItem };

export interface ITransferRequest {
  id: number;
  from: number;
  to: number;
  items: ITransferItem[];
  status: TransferRequestStatus;
  requestedBy: User;
  approvedBy?: User;
}

// Export Prisma TransferRequest type as default
export type TransferRequest = PrismaTransferRequest;
export default TransferRequest;
