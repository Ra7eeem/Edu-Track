import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as ClassTaskService from "./class-task.service";
import { CreateClassTaskDto, SendTaskReminderDto } from "./class-task.schemas";

const p = (v: string | string[]): string => String(v);

export const createClassTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await ClassTaskService.createClassTask(
    req.user!.userId,
    req.body as CreateClassTaskDto
  );
  sendSuccess(res, task, 201, "تم إنشاء المهمة بنجاح");
});

export const getClassTasks = asyncHandler(async (req: Request, res: Response) => {
  const data = await ClassTaskService.getClassTasks(
    req.user!.userId,
    req.user!.role,
    p(req.params.classroomId)
  );
  sendSuccess(res, data);
});

export const getClassTaskProgress = asyncHandler(async (req: Request, res: Response) => {
  const data = await ClassTaskService.getClassTaskProgress(
    req.user!.userId,
    p(req.params.taskId)
  );
  sendSuccess(res, data);
});

export const toggleStudentTaskProgress = asyncHandler(async (req: Request, res: Response) => {
  const progress = await ClassTaskService.toggleStudentTaskProgress(
    req.user!.userId,
    p(req.params.taskId)
  );
  sendSuccess(res, progress, 200, "تم تحديث حالة إنجاز المهمة");
});

export const sendTaskReminder = asyncHandler(async (req: Request, res: Response) => {
  const result = await ClassTaskService.sendTaskReminder(
    req.user!.userId,
    p(req.params.taskId),
    req.body as SendTaskReminderDto
  );
  sendSuccess(res, result);
});
