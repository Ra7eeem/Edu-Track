import mongoose, { Document, Schema, Model } from "mongoose";
import { TaskType } from "./ClassTask";

export interface IStudentTaskProgress extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;      // Ref: ClassTask
  student: mongoose.Types.ObjectId;   // Ref: User
  classroom: mongoose.Types.ObjectId; // Ref: Group
  type: TaskType;
  dateStr?: string;                  // Format: "YYYY-MM-DD" for DAILY; omitted/null for ONCE
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentTaskProgressSchema = new Schema<IStudentTaskProgress>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "ClassTask",
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
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      required: true,
      index: true,
    },
    dateStr: {
      type: String,
      trim: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Unique index: For ONCE tasks (one record per task & student)
studentTaskProgressSchema.index(
  { task: 1, student: 1 },
  {
    unique: true,
    partialFilterExpression: { dateStr: { $exists: false } },
    name: "uniq_task_student_once",
  }
);

// Unique index: For DAILY tasks (one record per task, student & dateStr)
studentTaskProgressSchema.index(
  { task: 1, student: 1, dateStr: 1 },
  {
    unique: true,
    partialFilterExpression: { dateStr: { $exists: true } },
    name: "uniq_task_student_daily",
  }
);

export const StudentTaskProgress: Model<IStudentTaskProgress> =
  mongoose.models.StudentTaskProgress ??
  mongoose.model<IStudentTaskProgress>("StudentTaskProgress", studentTaskProgressSchema);

export default StudentTaskProgress;
