import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICourse extends Document {
  _id: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId; // Ref: Group
  teacher: mongoose.Types.ObjectId;   // Ref: User
  title: string;
  description: string;
  thumbnailUrl?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
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
      maxlength: 2000,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: null,
    },
    order: {
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

courseSchema.index({ classroom: 1, order: 1 });

export const Course: Model<ICourse> =
  mongoose.models.Course ?? mongoose.model<ICourse>("Course", courseSchema);

export default Course;
