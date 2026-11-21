import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPushSubscription extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true }
);

pushSubscriptionSchema.index({ user: 1, endpoint: 1 });

export const PushSubscription: Model<IPushSubscription> =
  mongoose.models.PushSubscription ??
  mongoose.model<IPushSubscription>("PushSubscription", pushSubscriptionSchema);

export default PushSubscription;
