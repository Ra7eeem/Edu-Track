import mongoose, { Document, Schema, Model } from "mongoose";

export enum WatchStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface ILessonProgress extends Document {
  _id: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;    // Ref: Lesson
  course: mongoose.Types.ObjectId;    // Ref: Course
  student: mongoose.Types.ObjectId;   // Ref: User
  lastPositionSeconds: number;       // Exact second where student stopped
  durationSeconds: number;           // Total video length
  percentage: number;                // 0 to 100
  status: WatchStatus;
  isCompleted: boolean;
  completedAt?: Date | null;
  lastWatchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const lessonProgressSchema = new Schema<ILessonProgress>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lastPositionSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: Object.values(WatchStatus),
      default: WatchStatus.NOT_STARTED,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique compound index: One record per (lesson, student)
lessonProgressSchema.index({ lesson: 1, student: 1 }, { unique: true });

export const LessonProgress: Model<ILessonProgress> =
  mongoose.models.LessonProgress ??
  mongoose.model<ILessonProgress>("LessonProgress", lessonProgressSchema);

export default LessonProgress;
