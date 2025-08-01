import mongoose, { Schema, Document } from "mongoose";
export interface IStore extends Document {
  name: string;
  location: string;
}
const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true },
  location: { type: String, required: true },
  storekeeper: { type: Schema.Types.ObjectId, ref: "User" },
});
export default mongoose.model<IStore>("Store", StoreSchema);
