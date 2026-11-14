"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiResponse } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { studentMessageSchema } from "../schemas/student.schema"
import type { StudentActionResult } from "../types/student"

export async function studentSendMessageAction(values: {
  groupId: string
  teacherId: string
  content: string
}): Promise<StudentActionResult> {
  const parsed = studentMessageSchema.safeParse(values)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
  }

  const token = await getNextAuthToken()
  if (!token?.token) {
    return { success: false, error: "غير مصرح، يرجى تسجيل الدخول أولاً" }
  }

  try {
    const res = await fetch(`${BASE_API_URL}/api/anonymous`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(parsed.data),
    })

    const json: ApiResponse<unknown> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "فشل إرسال الرسالة" }
    }

    revalidatePath("/student/messages")
    return { success: true, data: json.data }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "فشل إرسال الرسالة" }
  }
}

export async function studentDeleteMessageAction(
  messageId: string
): Promise<StudentActionResult> {
  if (!messageId) return { success: false, error: "معرف الرسالة مطلوب" }

  const token = await getNextAuthToken()
  if (!token?.token) {
    return { success: false, error: "غير مصرح، يرجى تسجيل الدخول أولاً" }
  }

  try {
    const res = await fetch(`${BASE_API_URL}/api/anonymous/${messageId}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })

    const json: ApiResponse<unknown> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "فشل حذف الرسالة" }
    }

    revalidatePath("/student/messages")
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "فشل حذف الرسالة" }
  }
}
