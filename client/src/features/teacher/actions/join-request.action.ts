"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const requestIdSchema = z.string().min(1, "معرّف الطلب مطلوب")

type ActionResult =
  | { success: true }
  | { error: string }

export async function approveJoinRequestAction(requestId: string): Promise<ActionResult> {
  const parsed = requestIdSchema.safeParse(requestId)
  if (!parsed.success) return { error: "معرّف الطلب غير صالح" }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/teacher/join-requests/${requestId}/approve`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ" }

    revalidatePath("/teacher/join-requests")
    revalidatePath("/teacher/groups")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}

export async function rejectJoinRequestAction(requestId: string): Promise<ActionResult> {
  const parsed = requestIdSchema.safeParse(requestId)
  if (!parsed.success) return { error: "معرّف الطلب غير صالح" }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/teacher/join-requests/${requestId}/reject`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
    })
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ" }

    revalidatePath("/teacher/join-requests")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}
