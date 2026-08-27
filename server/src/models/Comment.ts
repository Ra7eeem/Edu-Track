import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // null = top-level comment, set = reply
  repliesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "محتوى التعليق مطلوب"],
      trim: true,
      maxlength: [2000, "التعليق لا يتجاوز 2000 حرف"],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    repliesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

commentSchema.index({ post: 1, createdAt: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ author: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const Comment: Model<IComment> =
  mongoose.models.Comment ??
  mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
