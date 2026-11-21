import mongoose, { Document, Schema, Model } from "mongoose";

export type ScoreActionType = "ATTENDANCE" | "MANUAL_BONUS" | "MANUAL_PENALTY" | "CYCLE_RESET";

export interface IScoreLog extends Document {
  _id: mongoose.Types.ObjectId;
  team?: mongoose.Types.ObjectId;
  student?: mongoose.Types.ObjectId;
  classroom?: mongoose.Types.ObjectId;
  points: number; // Positive or negative
  reason: string;
  actionType: ScoreActionType;
  awardedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const scoreLogSchema = new Schema<IScoreLog>(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    points: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    actionType: {
      type: String,
      enum: ["ATTENDANCE", "MANUAL_BONUS", "MANUAL_PENALTY", "CYCLE_RESET"],
      required: true,
    },
    awardedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

scoreLogSchema.index({ team: 1, createdAt: -1 });
scoreLogSchema.index({ student: 1, createdAt: -1 });
scoreLogSchema.index({ classroom: 1, createdAt: -1 });

export const ScoreLog: Model<IScoreLog> =
  mongoose.models.ScoreLog ?? mongoose.model<IScoreLog>("ScoreLog", scoreLogSchema);

export default ScoreLog;
