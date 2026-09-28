import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IStudentScore extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  score: number;       // PRESENT=2, LATE=1, ABSENT=0 + bonus
  presentCount: number;
  lateCount: number;
  absentCount: number;
  bonusPoints: number; // extra points added manually by teacher
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const studentScoreSchema = new Schema<IStudentScore>(
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
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bonusPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

// One score record per student per group
studentScoreSchema.index(
  { student: 1, group: 1 },
  { unique: true }
);
studentScoreSchema.index({ group: 1 });
studentScoreSchema.index({ student: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const StudentScore: Model<IStudentScore> =
  mongoose.models.StudentScore ??
  mongoose.model<IStudentScore>("StudentScore", studentScoreSchema);

export default StudentScore;
