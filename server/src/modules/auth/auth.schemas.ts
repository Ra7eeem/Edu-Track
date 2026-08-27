import { z } from "zod";
import { Grade } from "../../types";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "البريد الإلكتروني مطلوب" })
    .email("البريد الإلكتروني غير صالح")
    .toLowerCase(),
  password: z
    .string({ required_error: "كلمة المرور مطلوبة" })
    .min(1, "كلمة المرور مطلوبة"),
});

export const registerStudentSchema = z.object({
  name: z
    .string({ required_error: "الاسم مطلوب" })
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100, "الاسم لا يتجاوز 100 حرف")
    .trim(),
  email: z
    .string({ required_error: "البريد الإلكتروني مطلوب" })
    .email("البريد الإلكتروني غير صالح")
    .toLowerCase(),
  password: z
    .string({ required_error: "كلمة المرور مطلوبة" })
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone: z
    .string({ required_error: "رقم الهاتف مطلوب" })
    .min(7, "رقم الهاتف غير صالح")
    .max(20, "رقم الهاتف غير صالح"),
  grade: z.nativeEnum(Grade, {
    required_error: "الصف الدراسي مطلوب",
    invalid_type_error: "الصف الدراسي غير صالح",
  }),
  groupId: z
    .string({ required_error: "يجب اختيار المجموعة" })
    .min(1, "يجب اختيار المجموعة"),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterStudentDto = z.infer<typeof registerStudentSchema>;
