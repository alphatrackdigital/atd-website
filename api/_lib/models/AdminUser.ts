import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export const AdminUser =
  (mongoose.models.AdminUser as mongoose.Model<IAdminUser>) ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
