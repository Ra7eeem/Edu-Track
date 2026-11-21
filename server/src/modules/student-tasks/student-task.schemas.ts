import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "عنوان المهمة مطلوب").max(250, "عنوان المهمة طويل جداً"),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).optional()),
});

export const reorderTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1, "يجب تحديد المهام للترتيب"),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export type ReorderTasksDto = z.infer<typeof reorderTasksSchema>;
