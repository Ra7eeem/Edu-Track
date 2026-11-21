import mongoose, { Document, Schema, Model } from "mongoose";

export interface IStudentTaskProgress extends Document {
  _id: mongoose.Types.ObjectId;
  task: mongoose.Types.ObjectId;     // Ref: ClassTask
  student: mongoose.Types.ObjectId;  // Ref: User
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

// Compound unique index: { task: 1, student: 1 }
studentTaskProgressSchema.index({ task: 1, student: 1 }, { unique: true });
studentTaskProgressSchema.index({ student: 1, isCompleted: 1 });

export const StudentTaskProgress: Model<IStudentTaskProgress> =
  mongoose.models.StudentTaskProgress ??
  mongoose.model<IStudentTaskProgress>("StudentTaskProgress", studentTaskProgressSchema);

export default StudentTaskProgress;
