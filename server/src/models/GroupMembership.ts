import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IGroupMembership extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  joinedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const groupMembershipSchema = new Schema<IGroupMembership>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

groupMembershipSchema.index({ student: 1, group: 1 }, { unique: true });
groupMembershipSchema.index({ group: 1 });
groupMembershipSchema.index({ student: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const GroupMembership: Model<IGroupMembership> =
  mongoose.models.GroupMembership ??
  mongoose.model<IGroupMembership>("GroupMembership", groupMembershipSchema);

export default GroupMembership;
