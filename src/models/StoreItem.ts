import mongoose, { Schema, Document, Types } from "mongoose";
export interface IStoreItem extends Document {
  storeId: Types.ObjectId;
  itemId: Types.ObjectId;
  quantity: number;
}
const StoreItemSchema = new Schema<IStoreItem>({
  storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true },
});
export default mongoose.model<IStoreItem>("StoreItem", StoreItemSchema);
