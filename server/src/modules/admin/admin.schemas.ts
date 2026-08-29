import { z } from "zod";
import { Grade } from "../../types";

export const createTeacherSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
});

export const createGroupSchema = z.object({
  name:        z.string().min(2, "اسم المجموعة مطلوب").max(150).trim(),
  description: z.string().max(1000).trim().optional(),
  grades:      z.array(z.nativeEnum(Grade)).optional().default([]),
  teacherIds:  z.array(z.string()).optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(2).max(150).trim().optional(),
  description: z.string().max(1000).trim().optional(),
  isActive: z.boolean().optional(),
});

export const addTeacherToGroupSchema = z.object({
  teacherId: z.string().min(1, "معرّف المدرس مطلوب"),
});

export const updateAdminProfileSchema = z.object({
  name:        z.string().min(2).max(100).trim().optional(),
  phone:       z.string().min(7).max(20).trim().optional(),
  oldPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").optional(),
}).refine(d => !(d.newPassword && !d.oldPassword), {
  message: "يجب إدخال كلمة المرور القديمة لتغيير كلمة المرور",
  path: ["oldPassword"],
})

export type CreateTeacherDto      = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherDto      = z.infer<typeof updateTeacherSchema>;
export type CreateGroupAdminDto   = z.infer<typeof createGroupSchema>;
export type UpdateGroupDto        = z.infer<typeof updateGroupSchema>;
export type AddTeacherToGroupDto  = z.infer<typeof addTeacherToGroupSchema>;
export type UpdateAdminProfileDto = z.infer<typeof updateAdminProfileSchema>;
