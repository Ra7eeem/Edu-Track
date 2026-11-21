import mongoose, { Document, Schema, Model } from "mongoose";
import { Role, Grade } from "../types";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  grade?: Grade;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "الاسم مطلوب"],
      trim: true,
      maxlength: [100, "الاسم لا يتجاوز 100 حرف"],
    },
    email: {
      type: String,
      required: [true, "البريد الإلكتروني مطلوب"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "البريد الإلكتروني غير صالح"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never returned by default
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    grade: {
      // GRADE_13 represents خريجو الطلائع — university students who have graduated from school
      type: String,
      enum: [...Object.values(Grade), null],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret["passwordHash"];
        return ret;
      },
    },
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

// email index is already created automatically via unique: true in schema definition
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);

export default User;
