import mongoose, { Document, Schema, Model } from "mongoose";

export interface ILessonComment extends Document {
  _id: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;  // Ref: Lesson
  author: mongoose.Types.ObjectId;  // Ref: User
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const lessonCommentSchema = new Schema<ILessonComment>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

lessonCommentSchema.index({ lesson: 1, createdAt: 1 });

export const LessonComment: Model<ILessonComment> =
  mongoose.models.LessonComment ??
  mongoose.model<ILessonComment>("LessonComment", lessonCommentSchema);

export default LessonComment;
