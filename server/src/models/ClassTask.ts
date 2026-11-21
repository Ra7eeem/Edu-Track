import mongoose, { Document, Schema, Model } from "mongoose";

export enum TaskType {
  ONCE = "ONCE",
  DAILY = "DAILY",
}

export interface IClassTask extends Document {
  _id: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId; // Ref: Group
  teacher: mongoose.Types.ObjectId;   // Ref: User
  title: string;
  description?: string;
  type: TaskType;
  dueDate?: Date | null;             // Only when type === 'ONCE'
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classTaskSchema = new Schema<IClassTask>(
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: Object.values(TaskType),
      default: TaskType.ONCE,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

classTaskSchema.index({ classroom: 1, isActive: 1, createdAt: -1 });

export const ClassTask: Model<IClassTask> =
  mongoose.models.ClassTask ?? mongoose.model<IClassTask>("ClassTask", classTaskSchema);

export default ClassTask;
