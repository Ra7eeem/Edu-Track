import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendPaginated } from "../../utils/response";
import * as NotificationService from "./notification.service";
import * as PushService from "./push.service";

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

export const getVapidPublicKey = asyncHandler(async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      publicKey: PushService.VAPID_PUBLIC_KEY,
    },
  });
});

export const savePushSubscription = asyncHandler(async (req: Request, res: Response) => {
  const sub = await PushService.saveSubscription(req.user!.userId, req.body.subscription);
  sendSuccess(res, sub, 201, "تم تفعيل إشعارات الويب بنجاح");
});

export const unsubscribePush = asyncHandler(async (req: Request, res: Response) => {
  await PushService.removeSubscription(req.body.endpoint);
  sendSuccess(res, null, 200, "تم إلغاء تفعيل إشعارات الويب");
});
