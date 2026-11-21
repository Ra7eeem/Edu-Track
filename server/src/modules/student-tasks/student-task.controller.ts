import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/response";
import * as StudentTaskService from "./student-task.service";
import { CreateTaskDto, ReorderTasksDto } from "./student-task.schemas";

const p = (v: string | string[]): string => String(v);

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const data = await StudentTaskService.getStudentTasks(req.user!.userId);
  sendSuccess(res, data);
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await StudentTaskService.createStudentTask(
    req.user!.userId,
    req.body as CreateTaskDto
  );
  sendSuccess(res, task, 201, "تم إضافة المهمة بنجاح");
});

export const toggleTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await StudentTaskService.toggleStudentTask(
    req.user!.userId,
    p(req.params.taskId)
  );
  sendSuccess(res, task, 200, "تم تحديث حالة المهمة");
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const result = await StudentTaskService.deleteStudentTask(
    req.user!.userId,
    p(req.params.taskId)
  );
  sendSuccess(res, result);
});

export const reorderTasks = asyncHandler(async (req: Request, res: Response) => {
  const result = await StudentTaskService.reorderStudentTasks(
    req.user!.userId,
    req.body as ReorderTasksDto
  );
  sendSuccess(res, result);
});
