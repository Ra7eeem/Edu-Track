import { z } from "zod"
import { Grade } from "@/shared/types/api"

// Matches Arabic letters, spaces, and common Arabic diacritics only
const arabicOnlyRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\s]+$/

export const registerStudentSchema = z.object({
  name: z
    .string()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(100)
    .regex(arabicOnlyRegex, "الاسم يجب أن يُكتب بالعربية فقط"),
  email:    z.string().min(1, "البريد الإلكتروني مطلوب").email("البريد غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone:    z.string().min(7, "رقم الهاتف غير صالح").max(20),
  grade:    z.nativeEnum(Grade, { required_error: "الصف الدراسي مطلوب" }),
  groupId:  z.string().min(1, "يجب اختيار المجموعة"),
})

export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>
