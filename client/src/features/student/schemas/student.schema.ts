/**
 * Student Feature Validation Schemas
 * Follows Rose-App Zod validation patterns
 */
import { z } from "zod"

export const submitExamSchema = z.object({
  assignmentId: z.string().min(1, "معرف الامتحان مطلوب"),
  groupId: z.string().optional(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1, "معرف السؤال مطلوب"),
        chosen: z.string().min(1, "الإجابة مطلوبة"),
      })
    )
    .min(1, "يجب الإجابة على سؤال واحد على الأقل"),
})

export type SubmitExamSchemaValues = z.infer<typeof submitExamSchema>

export const studentCommentSchema = z.object({
  groupId: z.string().min(1, "معرف المجموعة مطلوب"),
  postId: z.string().min(1, "معرف المنشور مطلوب"),
  content: z.string().trim().min(1, "التعليق لا يمكن أن يكون فارغاً"),
  parentCommentId: z.string().optional(),
})

export type StudentCommentSchemaValues = z.infer<typeof studentCommentSchema>

export const studentMessageSchema = z.object({
  groupId: z.string().min(1, "اختر المجموعة"),
  teacherId: z.string().min(1, "اختر المدرس"),
  content: z.string().trim().min(3, "محتوى الرسالة يجب أن يكون 3 أحرف على الأقل"),
})

export type StudentMessageSchemaValues = z.infer<typeof studentMessageSchema>

