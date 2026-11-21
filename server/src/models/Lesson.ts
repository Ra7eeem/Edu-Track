import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILesson extends Document {
  _id: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;    // Ref: Course
  classroom: mongoose.Types.ObjectId; // Ref: Group
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  durationSeconds?: number;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    classroom: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
      index: true,
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
      maxlength: 3000,
      default: "",
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeVideoId: {
      type: String,
      required: true,
      trim: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
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

lessonSchema.index({ course: 1, order: 1 });

export const Lesson: Model<ILesson> =
  mongoose.models.Lesson ?? mongoose.model<ILesson>("Lesson", lessonSchema);

export default Lesson;
