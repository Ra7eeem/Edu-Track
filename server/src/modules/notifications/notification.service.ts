import { Notification } from "../../models/Notification";
import { parsePagination, buildPaginationMeta } from "../../utils/pagination";
import { ApiError } from "../../utils/ApiError";
import mongoose from "mongoose";
import { Request } from "express";

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
