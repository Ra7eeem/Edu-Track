import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const groupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, "اسم المجموعة مطلوب"],
      trim: true,
      maxlength: [150, "اسم المجموعة لا يتجاوز 150 حرفاً"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "الوصف لا يتجاوز 1000 حرف"],
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

groupSchema.index({ name: "text" });
groupSchema.index({ isActive: 1 });
groupSchema.index({ createdBy: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const Group: Model<IGroup> =
  mongoose.models.Group ?? mongoose.model<IGroup>("Group", groupSchema);

export default Group;
