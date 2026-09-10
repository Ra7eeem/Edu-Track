"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const requestIdSchema = z.string().min(1, "معرّف الطلب مطلوب")

type ActionResult =
  | { success: true }
  | { error: string }

export async function approveJoinRequestAction(requestId: string): Promise<ActionResult> {
  const parsed = requestIdSchema.safeParse(requestId)
  if (!parsed.success) return { error: "معرّف الطلب غير صالح" }

  try {
    await serverFetch<void>(`/api/teacher/join-requests/${requestId}/approve`, {
      method: "POST",
    })
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

  try {
    await serverFetch<void>(`/api/teacher/join-requests/${requestId}/reject`, {
      method: "POST",
    })
    revalidatePath("/teacher/join-requests")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}
