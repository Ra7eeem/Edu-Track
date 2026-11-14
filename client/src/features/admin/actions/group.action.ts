"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiGroup, ApiResponse } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createGroupSchema = z.object({
  name:        z.string().min(1, "اسم المجموعة مطلوب").max(100),
  description: z.string().max(500).optional(),
  grades:      z.array(z.string()).optional(),
  teacherIds:  z.array(z.string()).optional(),
})

export type GroupActionState = { error?: string; success?: boolean }

export async function createGroupAction(
  _prev: GroupActionState,
  formData: FormData
): Promise<GroupActionState> {
  const raw = {
    name:        (formData.get("name") as string) ?? "",
    description: (formData.get("description") as string)?.trim() || undefined,
    grades:      formData.getAll("grades").map(String),
    teacherIds:  formData.getAll("teacherIds").map(String),
  }

  const parsed = createGroupSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  const body = {
    name:        parsed.data.name.trim(),
    description: parsed.data.description,
    grades:      parsed.data.grades && parsed.data.grades.length > 0 ? parsed.data.grades : undefined,
    teacherIds:  parsed.data.teacherIds && parsed.data.teacherIds.length > 0 ? parsed.data.teacherIds : undefined,
  }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/groups`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(body),
    })
    const json: ApiResponse<ApiGroup> = await res.json()
    if (!res.ok || !json.success) return { error: json.message || "حدث خطأ أثناء إنشاء المجموعة" }
    revalidatePath("/admin/groups")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إنشاء المجموعة" }
  }
}

export async function deleteGroupAction(id: string): Promise<GroupActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/groups/${id}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء الحذف" }
    revalidatePath("/admin/groups")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء الحذف" }
  }
}

export async function addTeacherToGroupAction(
  groupId: string,
  teacherId: string
): Promise<GroupActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/groups/${groupId}/teachers`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ teacherId }),
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء إضافة المدرس" }
    revalidatePath(`/admin/group/${groupId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إضافة المدرس" }
  }
}

export async function removeTeacherFromGroupAction(
  groupId: string,
  teacherId: string
): Promise<GroupActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/groups/${groupId}/teachers/${teacherId}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء إزالة المدرس" }
    revalidatePath(`/admin/group/${groupId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء إزالة المدرس" }
  }
}

export async function removeStudentFromGroupAction(
  groupId: string,
  studentId: string
): Promise<GroupActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/groups/${groupId}/students/${studentId}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء حذف الطالب" }
    revalidatePath(`/admin/group/${groupId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ أثناء حذف الطالب" }
  }
}
