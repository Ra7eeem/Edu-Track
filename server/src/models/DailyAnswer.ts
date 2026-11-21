import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDailyAnswer extends Document {
  _id: mongoose.Types.ObjectId;
  dailyQuestion: mongoose.Types.ObjectId; // Ref: DailyQuestion
  student: mongoose.Types.ObjectId;       // Ref: User
  classroom: mongoose.Types.ObjectId;     // Ref: Group
  selectedOptionIndex: number;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dailyAnswerSchema = new Schema<IDailyAnswer>(
  {
    dailyQuestion: {
      type: Schema.Types.ObjectId,
      ref: "DailyQuestion",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    selectedOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique compound index: 1 answer per student per daily question
dailyAnswerSchema.index({ dailyQuestion: 1, student: 1 }, { unique: true });
dailyAnswerSchema.index({ classroom: 1, student: 1, answeredAt: -1 });

export const DailyAnswer: Model<IDailyAnswer> =
  mongoose.models.DailyAnswer ??
  mongoose.model<IDailyAnswer>("DailyAnswer", dailyAnswerSchema);

export default DailyAnswer;
