import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import * as NotificationController from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.use(authenticate);

notificationRouter.get("/", NotificationController.getNotifications);
notificationRouter.post("/read-all", NotificationController.markAllAsRead);
notificationRouter.post("/:id/read", NotificationController.markAsRead);
