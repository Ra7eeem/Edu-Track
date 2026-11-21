import { z } from "zod";

export const createCourseSchema = z.object({
  classroomId: z.string().min(1, "معرف المجموعة مطلوب"),
  title: z.string().min(1, "عنوان الكورس مطلوب").max(200),
  description: z.string().max(2000).optional(),
  thumbnailUrl: z.string().url("رابط الصورة غير صالح").optional().nullable(),
  order: z.number().int().optional(),
});

export type CreateCourseDto = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateCourseDto = z.infer<typeof updateCourseSchema>;

export const createLessonSchema = z.object({
  title: z.string().min(1, "عنوان الدرس مطلوب").max(200),
  description: z.string().max(3000).optional(),
  youtubeUrl: z.string().min(1, "رابط فيديو اليوتيوب مطلوب"),
  durationSeconds: z.number().min(0).optional(),
  order: z.number().int().optional(),
});

export type CreateLessonDto = z.infer<typeof createLessonSchema>;

export const updateLessonProgressSchema = z.object({
  currentPositionSeconds: z.number().min(0),
  durationSeconds: z.number().min(0),
  isEnded: z.boolean().optional().default(false),
});

export type UpdateLessonProgressDto = z.infer<typeof updateLessonProgressSchema>;

export const createLessonCommentSchema = z.object({
  content: z.string().min(1, "محتوى التعليق مطلوب").max(1000),
});

export type CreateLessonCommentDto = z.infer<typeof createLessonCommentSchema>;
