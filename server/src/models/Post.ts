import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const postSchema = new Schema<IPost>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "محتوى المنشور مطلوب"],
      trim: true,
      maxlength: [5000, "المنشور لا يتجاوز 5000 حرف"],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    // Denormalized counters for fast reads
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
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

postSchema.index({ group: 1, createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ content: "text" });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const Post: Model<IPost> =
  mongoose.models.Post ?? mongoose.model<IPost>("Post", postSchema);

export default Post;
