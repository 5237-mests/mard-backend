import mongoose, { Schema, Document } from "mongoose";
export interface IShop extends Document {
  name: string;
  location: string;
}
const ShopSchema = new Schema<IShop>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  shopkeeper: { type: Schema.Types.ObjectId, ref: "User" },
});
export default mongoose.model<IShop>("Shop", ShopSchema);
