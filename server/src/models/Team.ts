import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITeam extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  classroom: mongoose.Types.ObjectId; // Reference to Group
  teacher: mongoose.Types.ObjectId;   // Reference to User
  members: mongoose.Types.ObjectId[]; // User refs (Role: STUDENT)
  totalScore: number;
  currentCycleScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    currentCycleScore: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

teamSchema.index({ classroom: 1, name: 1 });
teamSchema.index({ classroom: 1, isActive: 1 });
teamSchema.index({ members: 1 });

export const Team: Model<ITeam> =
  mongoose.models.Team ?? mongoose.model<ITeam>("Team", teamSchema);

export default Team;
