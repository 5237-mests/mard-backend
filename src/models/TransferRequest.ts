import { TransferRequest as DatabaseTransferRequest, ITransferItem, TransferRequestStatus } from "../types/database";

export interface ITransferRequest {
  id: number;
  from: number;
  to: number;
  items: ITransferItem[];
  status: TransferRequestStatus;
  requestedById: number;
  approvedById?: number;
}

// Export database TransferRequest type as default
export type TransferRequest = DatabaseTransferRequest;
export default TransferRequest;
