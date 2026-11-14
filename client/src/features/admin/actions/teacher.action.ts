"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiResponse, ApiUser } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createTeacherSchema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email:    z.string().email("البريد غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
})

export type TeacherActionState = { error?: string; success?: boolean }

export async function createTeacherAction(
  _prev: TeacherActionState,
  formData: FormData
): Promise<TeacherActionState> {
  const raw = {
    name:     (formData.get("name")     as string) ?? "",
    email:    (formData.get("email")    as string) ?? "",
    password: (formData.get("password") as string) ?? "",
  }

  const parsed = createTeacherSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/teachers`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(parsed.data),
    })
    const json: ApiResponse<ApiUser> = await res.json()
    if (!res.ok || !json.success) return { error: json.message || "حدث خطأ أثناء إنشاء الحساب" }
    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إنشاء الحساب" }
  }
}

export async function deleteTeacherAction(id: string): Promise<TeacherActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/teachers/${id}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء الحذف" }
    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء الحذف" }
  }
}

export async function toggleTeacherStatusAction(
  id: string,
  isActive: boolean
): Promise<TeacherActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/teachers/${id}`, {
      method: "PATCH",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ isActive }),
    })
    const json: ApiResponse<ApiUser> = await res.json()
    if (!res.ok || !json.success) return { error: json.message || "حدث خطأ أثناء التحديث" }
    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء التحديث" }
  }
}
