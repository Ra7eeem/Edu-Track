import mongoose, { Document, Schema, Model } from "mongoose";

// ─────────────────────────────────────────
// Interface
// ─────────────────────────────────────────

export interface IPostLike extends Document {
  _id: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const postLikeSchema = new Schema<IPostLike>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// ─────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────

// Prevent double-likes
postLikeSchema.index({ post: 1, user: 1 }, { unique: true });
postLikeSchema.index({ post: 1 });
postLikeSchema.index({ user: 1 });

// ─────────────────────────────────────────
// Model
// ─────────────────────────────────────────

export const PostLike: Model<IPostLike> =
  mongoose.models.PostLike ??
  mongoose.model<IPostLike>("PostLike", postLikeSchema);

export default PostLike;
