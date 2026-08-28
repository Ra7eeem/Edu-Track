import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IMonthlyScore extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  month: number;
  year: number;
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

const monthlyScoreSchema = new Schema<IMonthlyScore>(
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
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
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

// One score record per student per group per month/year
monthlyScoreSchema.index(
  { student: 1, group: 1, month: 1, year: 1 },
  { unique: true }
);
monthlyScoreSchema.index({ group: 1, month: 1, year: 1 });
monthlyScoreSchema.index({ student: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const MonthlyScore: Model<IMonthlyScore> =
  mongoose.models.MonthlyScore ??
  mongoose.model<IMonthlyScore>("MonthlyScore", monthlyScoreSchema);

export default MonthlyScore;
