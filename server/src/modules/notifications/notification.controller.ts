import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as NotificationService from "./notification.service";

const p = (v: string | string[]): string => String(v);

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { data, pagination, unreadCount } = await NotificationService.getNotifications(
    req.user!.userId,
    req
  );
  res.status(200).json({ success: true, data, pagination, unreadCount });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await NotificationService.markAsRead(
    req.user!.userId,
    p(req.params.id)
  );
  sendSuccess(res, notification, 200, "تم تحديد الإشعار كمقروء");
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await NotificationService.markAllAsRead(req.user!.userId);
  sendSuccess(res, null, 200, "تم تحديد جميع الإشعارات كمقروءة");
});
