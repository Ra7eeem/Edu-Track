import mongoose from "mongoose";
import { PushSubscription } from "../../models/PushSubscription";
import { logger } from "../../utils/logger";

// Default VAPID Keys (can be overridden via env vars on Vercel Dashboard)
export const VAPID_PUBLIC_KEY =
  process.env.VAPID_PUBLIC_KEY ??
  "BHjbeqV03OfMSnmQtpXFry6UK0bDtqjxY0BfMW7uJFhzcu22gx7Fzrqqw71-hai3TfNCLzqvoCssTm5TEwt7uxo";

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ?? "tMXrP0P4B_5GHTsCxzBmFAOMrpmkRnt10r-nwhrM_zs";

export const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT ?? "mailto:admin@edutrack.com";

let webpushInstance: any = null;
let vapidConfigured = false;

function getWebPush(): any {
  if (!webpushInstance) {
    try {
      // Safe dynamic require for CommonJS runtime
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require("web-push");
      webpushInstance = mod.default ?? mod;
    } catch (err) {
      logger.warn("WebPush library load error:", err);
      return null;
    }
  }

  if (webpushInstance && !vapidConfigured) {
    try {
      webpushInstance.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
      vapidConfigured = true;
    } catch (err) {
      logger.warn("WebPush VAPID configuration error:", err);
    }
  }

  return webpushInstance;
}

export interface WebPushPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Save or update a student's push subscription
 */
export async function saveSubscription(
  userId: string | mongoose.Types.ObjectId,
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }
) {
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    throw new Error("Invalid push subscription structure");
  }

  const uId = typeof userId === "string" ? new mongoose.Types.ObjectId(userId) : userId;

  return await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      user: uId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    { upsert: true, new: true }
  );
}

/**
 * Remove an invalid/unsubscribed push subscription
 */
export async function removeSubscription(endpoint: string) {
  return await PushSubscription.deleteOne({ endpoint });
}

/**
 * Broadcast/Send Web Push notifications to multiple users (e.g. students or teachers)
 * Safe on Vercel: Runs concurrently and cleans up expired subscriptions (410 / 404).
 */
export async function sendWebPushNotification(
  userIds: (string | mongoose.Types.ObjectId)[],
  payload: WebPushPayload
): Promise<void> {
  const validIds = userIds
    .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => (typeof id === "string" ? new mongoose.Types.ObjectId(id) : id));

  if (validIds.length === 0) return;

  const wp = getWebPush();
  if (!wp) {
    logger.warn("WebPush instance unavailable, skipping push delivery");
    return;
  }

  const subscriptions = await PushSubscription.find({
    user: { $in: validIds },
  }).lean();

  if (subscriptions.length === 0) return;

  const notificationString = JSON.stringify({
    title: payload.title,
    body: payload.message,
    message: payload.message,
    icon: payload.icon ?? "/logo.png",
    badge: "/favicon.ico",
    data: {
      url: payload.url ?? (payload.metadata?.url as string) ?? "/student/notifications",
      ...payload.metadata,
    },
  });

  const sendPromises = subscriptions.map(async (sub) => {
    try {
      await wp.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        notificationString
      );
    } catch (err: any) {
      // 404 Not Found or 410 Gone means user unsubscribed or expired
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {});
      } else {
        logger.warn(`Failed to send web-push to sub ${sub._id}:`, err?.message ?? err);
      }
    }
  });

  // Do not block execution, resolve all notifications concurrently
  await Promise.allSettled(sendPromises);
}
