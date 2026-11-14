"use server"

import { serverFetch } from "@/shared/lib/api-server"
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

  try {
    const data = await serverFetch("/api/anonymous", {
      method: "POST",
      body: parsed.data,
    })
    revalidatePath("/student/messages")
    return { success: true, data }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "فشل إرسال الرسالة" }
  }
}

export async function studentDeleteMessageAction(
  messageId: string
): Promise<StudentActionResult> {
  if (!messageId) return { success: false, error: "معرف الرسالة مطلوب" }

  try {
    await serverFetch(`/api/anonymous/${messageId}`, {
      method: "DELETE",
    })
    revalidatePath("/student/messages")
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "فشل حذف الرسالة" }
  }
}

