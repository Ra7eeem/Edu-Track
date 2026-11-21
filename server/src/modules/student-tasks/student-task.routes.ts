import { Router } from "express";
import { authenticate, authorize } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { Role } from "../../types";
import { userLimiter } from "../../middleware/rateLimiter";
import { createTaskSchema, reorderTasksSchema } from "./student-task.schemas";
import * as StudentTaskController from "./student-task.controller";

export const studentTaskRouter = Router();

// Student-only access, authenticated & rate limited
studentTaskRouter.use(authenticate, authorize(Role.STUDENT), userLimiter);

studentTaskRouter.get("/", StudentTaskController.getTasks);
studentTaskRouter.post("/", validate(createTaskSchema), StudentTaskController.createTask);
studentTaskRouter.patch("/:taskId/toggle", StudentTaskController.toggleTask);
studentTaskRouter.delete("/:taskId", StudentTaskController.deleteTask);
studentTaskRouter.patch("/reorder", validate(reorderTasksSchema), StudentTaskController.reorderTasks);
