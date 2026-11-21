import mongoose, { Document, Schema, Model } from "mongoose";

export interface IDailyQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId; // Ref: Group
  teacher: mongoose.Types.ObjectId;   // Ref: User
  date: string;                       // YYYY-MM-DD
  question: string;
  options: string[];                  // 4 options
  correctOptionIndex: number;         // 0..3
  explanation?: string;
  rewardPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const dailyQuestionSchema = new Schema<IDailyQuestion>(
  {
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    options: {
      type: [String],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length === 4,
        message: "سؤال اليوم يجب أن يحتوي على 4 خيارات",
      },
      required: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    rewardPoints: {
      type: Number,
      default: 5,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: 1 question per classroom per date
dailyQuestionSchema.index({ classroom: 1, date: 1 }, { unique: true });

export const DailyQuestion: Model<IDailyQuestion> =
  mongoose.models.DailyQuestion ??
  mongoose.model<IDailyQuestion>("DailyQuestion", dailyQuestionSchema);

export default DailyQuestion;
