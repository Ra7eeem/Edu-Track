"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { Grade } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const addStudentSchema = z.object({
  name:     z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .refine(
      (val) => val.trim().split(/\s+/).filter(Boolean).length >= 3,
      "الاسم يجب أن يكون ثلاثياً على الأقل (مثال: أحمد محمد علي)"
    ),
  email:    z.string().email(),
  password: z.string().min(8),
  phone:    z.string().min(7),
  grade:    z.nativeEnum(Grade),
  groupId:  z.string().min(1),
})

export type StudentActionState = {
  error?:       string
  success?:     boolean
  message?:     string
  fieldErrors?: Record<string, string[]>
}

export async function addStudentAction(
  _prev: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const raw = {
    name:     formData.get("name")     as string,
    email:    formData.get("email")    as string,
    password: formData.get("password") as string,
    phone:    formData.get("phone")    as string,
    grade:    formData.get("grade")    as string,
    groupId:  formData.get("groupId")  as string,
  }

  const parsed = addStudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/teacher/students`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(parsed.data),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء إضافة الطالب" }

    revalidatePath(`/teacher/group/${parsed.data.groupId}`)
    revalidatePath(`/teacher/group/${parsed.data.groupId}/students`)
    return { success: true, message: "تم إنشاء حساب الطالب بنجاح" }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إضافة الطالب" }
  }
}

export async function removeStudentAction(
  groupId: string,
  studentId: string
): Promise<StudentActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/teacher/groups/${groupId}/students/${studentId}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء حذف الطالب" }

    revalidatePath(`/teacher/group/${groupId}`)
    revalidatePath(`/teacher/group/${groupId}/students`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء حذف الطالب" }
  }
}

const updatePasswordSchema = z.object({
  studentId: z.string().min(1, "معرّف الطالب مطلوب"),
  password:  z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  groupId:   z.string().optional(),
})

export async function updateStudentPasswordAction(
  studentId: string,
  password:  string,
  groupId?:  string
): Promise<StudentActionState> {
  const parsed = updatePasswordSchema.safeParse({ studentId, password, groupId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" }
  }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/teacher/students/${studentId}/password`, {
      method: "PATCH",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ password: parsed.data.password, groupId: parsed.data.groupId }),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء تحديث كلمة المرور" }

    if (groupId) {
      revalidatePath(`/teacher/group/${groupId}/students`)
      revalidatePath(`/teacher/group/${groupId}/students/${studentId}`)
    }
    return { success: true, message: "تم تحديث كلمة مرور الطالب بنجاح" }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء تحديث كلمة المرور" }
  }
}
