import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IGroupTeacher extends Document {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const groupTeacherSchema = new Schema<IGroupTeacher>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

groupTeacherSchema.index({ group: 1, teacher: 1 }, { unique: true });
groupTeacherSchema.index({ teacher: 1 });
groupTeacherSchema.index({ group: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const GroupTeacher: Model<IGroupTeacher> =
  mongoose.models.GroupTeacher ??
  mongoose.model<IGroupTeacher>("GroupTeacher", groupTeacherSchema);

export default GroupTeacher;
