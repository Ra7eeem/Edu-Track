"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiResponse } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { studentCommentSchema } from "../schemas/student.schema"
import type { StudentActionResult } from "../types/student"

export type StudentPostActionState = StudentActionResult

export async function studentToggleLikeAction(
  groupId: string,
  postId: string
): Promise<StudentActionResult> {
  if (!groupId || !postId) return { success: false, error: "معرف غير صالح" }

  const token = await getNextAuthToken()
  if (!token?.token) return { success: false, error: "غير مصرح، يرجى تسجيل الدخول" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json: ApiResponse<unknown> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "حدث خطأ" }
    }
    revalidatePath(`/student/group`)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}

export async function studentCreateCommentAction(
  groupId: string,
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<StudentActionResult> {
  const parsed = studentCommentSchema.safeParse({ groupId, postId, content, parentCommentId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
  }

  const token = await getNextAuthToken()
  if (!token?.token) return { success: false, error: "غير مصرح، يرجى تسجيل الدخول" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ content: parsed.data.content, ...(parentCommentId ? { parentCommentId } : {}) }),
    })
    const json: ApiResponse<unknown> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "حدث خطأ" }
    }
    revalidatePath(`/student/group`)
    return { success: true, data: json.data }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}

export async function studentDeleteCommentAction(
  groupId: string,
  postId: string,
  commentId: string
): Promise<StudentActionResult> {
  if (!groupId || !postId || !commentId) return { success: false, error: "معرف غير صالح" }

  const token = await getNextAuthToken()
  if (!token?.token) return { success: false, error: "غير مصرح، يرجى تسجيل الدخول" }

  try {
    const res = await fetch(
      `${BASE_API_URL}/api/groups/${groupId}/posts/${postId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.token),
        },
      }
    )
    const json: ApiResponse<unknown> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "حدث خطأ" }
    }
    revalidatePath(`/student/group`)
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}
