import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISaleItem {
  itemId: Types.ObjectId;
  quantitySold: number;
}

export interface ISale extends Document {
  shopId: Types.ObjectId;
  items: ISaleItem[];
  soldBy: Types.ObjectId;
  soldAt: Date;
}

const SaleSchema = new Schema<ISale>({
  shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
      quantitySold: { type: Number, required: true },
    },
  ],
  soldBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  soldAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISale>("Sale", SaleSchema);
