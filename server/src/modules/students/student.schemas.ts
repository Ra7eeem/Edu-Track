import { z } from "zod";
import { Grade } from "../../types";

export const updateStudentProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().min(7).max(20).optional(),
  grade: z.nativeEnum(Grade).optional(),
});

export type UpdateStudentProfileDto = z.infer<typeof updateStudentProfileSchema>;
