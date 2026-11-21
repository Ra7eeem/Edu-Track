import mongoose, { Document, Schema, Model } from "mongoose";

export interface IStudentTask extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  title: string;
  isCompleted: boolean;
  dueDate?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentTaskSchema = new Schema<IStudentTask>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

studentTaskSchema.index({ student: 1, isCompleted: 1, order: 1 });

export const StudentTask: Model<IStudentTask> =
  mongoose.models.StudentTask ?? mongoose.model<IStudentTask>("StudentTask", studentTaskSchema);

export default StudentTask;
