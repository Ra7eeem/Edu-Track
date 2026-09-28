import mongoose, { Document, Schema, Model } from "mongoose";

export interface IArchivedScore extends Document {
  student: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  archiveName: string;
  archivedAt: Date;
  score: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  bonusPoints: number;
}

const archivedScoreSchema = new Schema<IArchivedScore>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    group: { type: Schema.Types.ObjectId, ref: "Group", required: true },
    archiveName: { type: String, required: true },
    archivedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
    lateCount: { type: Number, default: 0 },
    absentCount: { type: Number, default: 0 },
    bonusPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

archivedScoreSchema.index({ group: 1, archivedAt: -1 });

export const ArchivedScore: Model<IArchivedScore> =
  mongoose.models.ArchivedScore ?? mongoose.model<IArchivedScore>("ArchivedScore", archivedScoreSchema);

export default ArchivedScore;
