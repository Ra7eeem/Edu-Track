import { z } from "zod";
import mongoose from "mongoose";

const objectIdRef = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "معرّف غير صالح");

export const createClassTaskSchema = z.object({
  classroomId: objectIdRef,
  title: z.string().min(1, "عنوان المهمة مطلوب").max(250, "عنوان المهمة طويل جداً"),
  description: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
});

export const updateClassTaskSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  description: z.string().max(1000).optional(),
  dueDate: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const sendTaskReminderSchema = z.object({
  studentIds: z.array(objectIdRef).optional(),
});

export type CreateClassTaskDto = z.infer<typeof createClassTaskSchema>;
export type UpdateClassTaskDto = z.infer<typeof updateClassTaskSchema>;
export type SendTaskReminderDto = z.infer<typeof sendTaskReminderSchema>;
