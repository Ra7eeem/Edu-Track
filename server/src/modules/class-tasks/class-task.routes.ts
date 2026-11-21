import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import { createClassTaskSchema, sendTaskReminderSchema } from "./class-task.schemas";
import * as ClassTaskController from "./class-task.controller";

export const classTaskRouter = Router();

classTaskRouter.use(authenticate, userLimiter);

// Teacher creates task
classTaskRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createClassTaskSchema),
  ClassTaskController.createClassTask
);

// Teacher checks progress & pending students
classTaskRouter.get(
  "/:taskId/progress",
  authorize(Role.TEACHER, Role.ADMIN),
  ClassTaskController.getClassTaskProgress
);

// Teacher sends reminder to pending students
classTaskRouter.post(
  "/:taskId/remind",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(sendTaskReminderSchema),
  ClassTaskController.sendTaskReminder
);

// Fetch tasks for a classroom (accessible to teacher, admin, and enrolled students)
classTaskRouter.get("/classroom/:classroomId", ClassTaskController.getClassTasks);

// Student toggles completion for a task
classTaskRouter.patch(
  "/:taskId/toggle",
  authorize(Role.STUDENT),
  ClassTaskController.toggleStudentTaskProgress
);
