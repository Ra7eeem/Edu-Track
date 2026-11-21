import mongoose, { Document, Schema, Model } from "mongoose";

export interface IClassTask extends Document {
  _id: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId; // Ref: Group
  teacher: mongoose.Types.ObjectId;   // Ref: User
  title: string;
  description?: string;
  dueDate?: Date;
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
      maxlength: 250,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    dueDate: {
      type: Date,
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
