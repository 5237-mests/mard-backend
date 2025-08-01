import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "admin" | "shopkeeper" | "storekeeper" | "user";
  isVerified?: boolean;
  verificationToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, maxLength: 1024 },
  role: {
    type: String,
    enum: ["admin", "shopkeeper", "storekeeper", "user"],
    default: "user",
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
