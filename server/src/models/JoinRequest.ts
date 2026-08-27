import mongoose, { Document, Schema, Model } from "mongoose";
import { JoinRequestStatus } from "../types";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IJoinRequest extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  status: JoinRequestStatus;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const joinRequestSchema = new Schema<IJoinRequest>(
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
    status: {
      type: String,
      enum: Object.values(JoinRequestStatus),
      default: JoinRequestStatus.PENDING,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

// One pending/active request per student per group
joinRequestSchema.index({ student: 1, group: 1 }, { unique: true });
joinRequestSchema.index({ group: 1, status: 1 });
joinRequestSchema.index({ student: 1 });
joinRequestSchema.index({ status: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const JoinRequest: Model<IJoinRequest> =
  mongoose.models.JoinRequest ??
  mongoose.model<IJoinRequest>("JoinRequest", joinRequestSchema);

export default JoinRequest;
