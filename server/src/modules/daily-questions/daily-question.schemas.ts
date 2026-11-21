import { z } from "zod";
import mongoose from "mongoose";

const objectIdRef = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), "معرّف غير صالح");

export const createDailyQuestionSchema = z.object({
  classroomId: objectIdRef,
  question: z.string().min(3, "نص السؤال يجب أن يكون 3 أحرف على الأقل").max(500, "نص السؤال طويل جداً"),
  options: z.array(z.string().min(1, "نص الاختيار مطلوب")).length(4, "يجب إدخال 4 اختيارات بالضبط"),
  correctOptionIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(1000).optional(),
  rewardPoints: z.number().int().min(1).default(5),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح (YYYY-MM-DD)").optional(),
});

export const answerDailyQuestionSchema = z.object({
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export type CreateDailyQuestionDto = z.infer<typeof createDailyQuestionSchema>;
export type AnswerDailyQuestionDto = z.infer<typeof answerDailyQuestionSchema>;
