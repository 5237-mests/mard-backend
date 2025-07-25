import mongoose, { Schema, Document, Types } from "mongoose";
export interface IShopItem extends Document {
  shopId: Types.ObjectId;
  itemId: Types.ObjectId;
  quantity: number;
}
const ShopItemSchema = new Schema<IShopItem>({
  shopId: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, required: true },
});
export default mongoose.model<IShopItem>("ShopItem", ShopItemSchema);
