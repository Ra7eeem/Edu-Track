import { z } from "zod";
import { Grade } from "../../types";

export const addStudentSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  phone: z.string().min(7).max(20),
  grade: z.nativeEnum(Grade),
  groupId: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().min(7).max(20).optional(),
});

export const updateStudentPasswordSchema = z.object({
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100),
  groupId:  z.string().optional(),
});

export type AddStudentDto = z.infer<typeof addStudentSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type UpdateStudentPasswordDto = z.infer<typeof updateStudentPasswordSchema>;
