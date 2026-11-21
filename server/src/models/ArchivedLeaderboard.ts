import mongoose, { Document, Schema, Model } from "mongoose";

export interface IArchivedLeaderboard extends Document {
  _id: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId;
  cycleName: string;
  winnerTeam?: {
    id: mongoose.Types.ObjectId;
    name: string;
    score: number;
  };
  teamSnapshots: Array<{
    teamId: mongoose.Types.ObjectId;
    name: string;
    score: number;
    memberCount: number;
  }>;
  resetBy: mongoose.Types.ObjectId;
  archivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const archivedLeaderboardSchema = new Schema<IArchivedLeaderboard>(
  {
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    cycleName: {
      type: String,
      required: true,
    },
    winnerTeam: {
      id: { type: Schema.Types.ObjectId, ref: "Team" },
      name: { type: String },
      score: { type: Number },
    },
    teamSnapshots: [
      {
        teamId: { type: Schema.Types.ObjectId, ref: "Team" },
        name: { type: String },
        score: { type: Number },
        memberCount: { type: Number },
      },
    ],
    resetBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

archivedLeaderboardSchema.index({ classroom: 1, archivedAt: -1 });

export const ArchivedLeaderboard: Model<IArchivedLeaderboard> =
  mongoose.models.ArchivedLeaderboard ??
  mongoose.model<IArchivedLeaderboard>("ArchivedLeaderboard", archivedLeaderboardSchema);

export default ArchivedLeaderboard;
