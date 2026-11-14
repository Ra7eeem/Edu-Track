"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiPost, ApiResponse } from "@/shared/types/api"
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

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/posts`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ content }),
    })
    const json: ApiResponse<ApiPost> = await res.json()
    if (!res.ok || !json.success) {
      return { error: json.message || "حدث خطأ أثناء إنشاء المنشور" }
    }
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
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/posts/${postId}`, {
      method: "DELETE",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      return { error: json.message || "حدث خطأ أثناء حذف المنشور" }
    }
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
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/posts/${postId}/like`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) {
      return { error: json.message || "حدث خطأ" }
    }
    revalidatePath(`/teacher/group/${groupId}/posts`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ" }
  }
}
