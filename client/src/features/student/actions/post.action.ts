"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { revalidatePath } from "next/cache"
import { studentCommentSchema } from "../schemas/student.schema"
import type { StudentActionResult } from "../types/student"

export type StudentPostActionState = StudentActionResult

export async function studentToggleLikeAction(
  groupId: string,
  postId: string
): Promise<StudentActionResult> {
  if (!groupId || !postId) return { success: false, error: "معرف غير صالح" }
  try {
    await serverFetch(`/api/groups/${groupId}/posts/${postId}/like`, { method: "POST" })
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

  try {
    const data = await serverFetch(`/api/groups/${groupId}/posts/${postId}/comments`, {
      method: "POST",
      body: { content: parsed.data.content, ...(parentCommentId ? { parentCommentId } : {}) },
    })
    revalidatePath(`/student/group`)
    return { success: true, data }
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
  try {
    await serverFetch(
      `/api/groups/${groupId}/posts/${postId}/comments/${commentId}`,
      { method: "DELETE" }
    )
    return { success: true }
  } catch (e: unknown) {
    return { success: false, error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}
