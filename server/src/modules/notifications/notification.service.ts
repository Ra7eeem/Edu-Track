import { Notification } from "../../models/Notification";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { ApiError } from "../../utils/ApiError";
import { NotificationType } from "../../types";
import mongoose from "mongoose";
import { Request } from "express";

export async function notifyUsers({
  userIds,
  type,
  title,
  message,
  metadata,
}: {
  userIds: (string | mongoose.Types.ObjectId)[];
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const validIds = userIds
    .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)))
    .map((id) => (typeof id === "string" ? new mongoose.Types.ObjectId(id) : id));

  if (validIds.length === 0) return;

  // Deduplicate user IDs so no user gets duplicate notifications for the same trigger
  const uniqueIds = Array.from(new Set(validIds.map((id) => String(id)))).map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const docs = uniqueIds.map((userId) => ({
    user: userId,
    type,
    title,
    message,
    metadata,
    isRead: false,
  }));

  await Notification.insertMany(docs);
}

export async function getNotifications(userId: string, req: Request) {
  const { page, limit, skip } = parsePagination(req);
  const onlyUnread = req.query.unread === "true";

  const filter: mongoose.FilterQuery<typeof Notification> = { user: userId };
  if (onlyUnread) filter.isRead = false;

  const [data, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    data,
    pagination: buildPaginationMeta(total, page, limit),
    unreadCount,
  };
}

export async function markAsRead(userId: string, notificationId: string) {
  if (!mongoose.Types.ObjectId.isValid(notificationId))
    throw ApiError.badRequest("معرّف غير صالح");

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification)
    throw ApiError.notFound("الإشعار غير موجود");
  return notification;
}

export async function markAllAsRead(userId: string) {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}
