import mongoose, { Schema, Document } from "mongoose";
export interface IItem extends Document {
  name: string;
  code: string;
  unit: string;
  description: string;
}
const ItemSchema = new Schema<IItem>({
  name: { type: String, required: true },
  code: { type: String, required: true },
  unit: { type: String, required: true },
  description: { type: String },
});
export default mongoose.model<IItem>("Item", ItemSchema);
