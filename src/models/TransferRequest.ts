import mongoose, { Schema, Document, Types } from "mongoose";
export interface ITransferItem {
  itemId: Types.ObjectId;
  quantity: number;
}
export interface ITransferRequest extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  items: ITransferItem[];
  status: "pending" | "approved" | "rejected";
  requestedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
}
const TransferRequestSchema = new Schema<ITransferRequest>({
  from: { type: Schema.Types.ObjectId, required: true },
  to: { type: Schema.Types.ObjectId, required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
});
export default mongoose.model<ITransferRequest>(
  "TransferRequest",
  TransferRequestSchema
);
