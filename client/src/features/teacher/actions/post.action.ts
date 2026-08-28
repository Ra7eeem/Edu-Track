"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiPost } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createPostSchema = z.object({
  content: z.string().min(1, "المحتوى مطلوب").max(5000),
})

export type PostActionState = {
  error?:   string
  success?: boolean
}

export async function createPostAction(
  groupId: string,
  content: string
): Promise<PostActionState> {
  const parsed = createPostSchema.safeParse({ content })
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await serverFetch<ApiPost>(`/api/groups/${groupId}/posts`, {
      method: "POST",
      body:   { content },
    })
    revalidatePath(`/teacher/group/${groupId}/posts`)
    revalidatePath(`/teacher/group/${groupId}`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إنشاء المنشور" }
  }
}

export async function deletePostAction(
  groupId: string,
  postId:  string
): Promise<PostActionState> {
  try {
    await serverFetch(`/api/groups/${groupId}/posts/${postId}`, {
      method: "DELETE",
    })
    revalidatePath(`/teacher/group/${groupId}/posts`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء حذف المنشور" }
  }
}

export async function toggleLikeAction(
  groupId: string,
  postId:  string
): Promise<PostActionState> {
  try {
    await serverFetch(`/api/groups/${groupId}/posts/${postId}/like`, {
      method: "POST",
    })
    revalidatePath(`/teacher/group/${groupId}/posts`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ" }
  }
}
