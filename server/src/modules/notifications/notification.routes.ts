import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { userLimiter } from "../../middleware/rateLimiter";
import * as NotificationController from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.use(authenticate, userLimiter);

notificationRouter.get("/", NotificationController.getNotifications);
notificationRouter.post("/read-all", NotificationController.markAllAsRead);
notificationRouter.post("/:id/read", NotificationController.markAsRead);
