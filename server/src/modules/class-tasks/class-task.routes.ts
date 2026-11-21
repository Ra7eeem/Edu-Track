import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import {
  createClassTaskSchema,
  sendTaskReminderSchema,
  toggleStudentTaskProgressSchema,
} from "./class-task.schemas";
import * as ClassTaskController from "./class-task.controller";

export const classTaskRouter = Router();

classTaskRouter.use(authenticate, userLimiter);

// 1. Teacher creates task: POST /api/v1/class-tasks
classTaskRouter.post(
  "/",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(createClassTaskSchema),
  ClassTaskController.createClassTask
);

// 2. Fetch tasks for a classroom: GET /api/v1/class-tasks/classroom/:classroomId
classTaskRouter.get("/classroom/:classroomId", ClassTaskController.getClassTasks);

// 3. Teacher checks progress breakdown: GET /api/v1/class-tasks/:taskId/breakdown
classTaskRouter.get(
  "/:taskId/breakdown",
  authorize(Role.TEACHER, Role.ADMIN),
  ClassTaskController.getClassTaskProgress
);
classTaskRouter.get(
  "/:taskId/progress",
  authorize(Role.TEACHER, Role.ADMIN),
  ClassTaskController.getClassTaskProgress
);

// 4. Student toggles completion for a task: PATCH /api/v1/class-tasks/:taskId/toggle
classTaskRouter.patch(
  "/:taskId/toggle",
  authorize(Role.STUDENT),
  validate(toggleStudentTaskProgressSchema),
  ClassTaskController.toggleStudentTaskProgress
);

// 5. Teacher sends reminder to pending students: POST /api/v1/class-tasks/:taskId/remind-pending
classTaskRouter.post(
  "/:taskId/remind-pending",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(sendTaskReminderSchema),
  ClassTaskController.sendTaskReminder
);
classTaskRouter.post(
  "/:taskId/remind",
  authorize(Role.TEACHER, Role.ADMIN),
  validate(sendTaskReminderSchema),
  ClassTaskController.sendTaskReminder
);
