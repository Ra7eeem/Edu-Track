"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { revalidatePath } from "next/cache"

export type StudentPostActionState = { success?: boolean; error?: string }

export async function studentToggleLikeAction(
  groupId: string,
  postId:  string
): Promise<StudentPostActionState> {
  try {
    await serverFetch(`/api/groups/${groupId}/posts/${postId}/like`, { method: "POST" })
    revalidatePath(`/student/group`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}

export async function studentCreateCommentAction(
  groupId: string,
  postId:  string,
  content: string
): Promise<StudentPostActionState> {
  if (!content.trim()) return { error: "التعليق لا يمكن أن يكون فارغاً" }
  try {
    await serverFetch(`/api/groups/${groupId}/posts/${postId}/comments`, {
      method: "POST",
      body:   { content: content.trim() },
    })
    revalidatePath(`/student/group`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}

export async function studentDeleteCommentAction(
  groupId:   string,
  postId:    string,
  commentId: string
): Promise<StudentPostActionState> {
  try {
    await serverFetch(
      `/api/groups/${groupId}/posts/${postId}/comments/${commentId}`,
      { method: "DELETE" }
    )
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}
