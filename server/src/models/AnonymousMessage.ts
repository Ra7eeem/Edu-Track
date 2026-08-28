import mongoose, { Document, Schema, Model } from "mongoose";

export interface IAnonymousMessage extends Document {
  _id:       mongoose.Types.ObjectId;
  group:     mongoose.Types.ObjectId;   // which group this message belongs to
  sender:    mongoose.Types.ObjectId;   // the actual student (hidden from teacher)
  teacher:   mongoose.Types.ObjectId;   // target teacher
  content:   string;
  reply:     string | null;             // teacher's reply
  repliedAt: Date | null;
  repliedBy: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const anonymousMessageSchema = new Schema<IAnonymousMessage>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "محتوى الرسالة مطلوب"],
      trim: true,
      maxlength: [2000, "الرسالة لا تتجاوز 2000 حرف"],
    },
    reply: {
      type: String,
      default: null,
      trim: true,
      maxlength: [2000, "الرد لا يتجاوز 2000 حرف"],
    },
    repliedAt: { type: Date, default: null },
    repliedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

anonymousMessageSchema.index({ teacher: 1, createdAt: -1 });
anonymousMessageSchema.index({ sender:  1, createdAt: -1 });
anonymousMessageSchema.index({ group:   1, createdAt: -1 });

export const AnonymousMessage: Model<IAnonymousMessage> =
  mongoose.models.AnonymousMessage ??
  mongoose.model<IAnonymousMessage>("AnonymousMessage", anonymousMessageSchema);

export default AnonymousMessage;
