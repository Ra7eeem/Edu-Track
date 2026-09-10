"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiUser } from "@/shared/types/api"
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

  try {
    await serverFetch<ApiUser>("/api/admin/teachers", {
      method: "POST",
      body:   parsed.data,
    })
    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إنشاء الحساب" }
  }
}

export async function deleteTeacherAction(id: string): Promise<TeacherActionState> {
  try {
    await serverFetch(`/api/admin/teachers/${id}`, { method: "DELETE" })
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
  try {
    await serverFetch<ApiUser>(`/api/admin/teachers/${id}`, {
      method: "PATCH",
      body:   { isActive },
    })
    revalidatePath("/admin/teachers")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء التحديث" }
  }
}