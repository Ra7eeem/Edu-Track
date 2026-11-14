"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { revalidatePath } from "next/cache"

export type RankingActionState = { success?: boolean; error?: string }

export async function resetRankingAction(
  groupId: string,
  month:   number,
  year:    number
): Promise<RankingActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(
      `${BASE_API_URL}/api/groups/${groupId}/ranking/reset?month=${month}&year=${year}`,
      {
        method: "POST",
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.token),
        },
      }
    )
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء التصفير" }
    revalidatePath(`/teacher/group/${groupId}/ranking`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء التصفير" }
  }
}

export async function addBonusAction(
  groupId:   string,
  studentId: string,
  bonus:     number,
  month:     number,
  year:      number
): Promise<RankingActionState> {
  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(
      `${BASE_API_URL}/api/groups/${groupId}/ranking/students/${studentId}/bonus?month=${month}&year=${year}`,
      {
        method: "POST",
        headers: {
          ...HEADERS.JsonBody,
          ...HEADERS.authorize(token.token),
        },
        body: JSON.stringify({ bonus }),
      }
    )
    const json = await res.json()
    if (!res.ok || json.success === false) return { error: json.message || "حدث خطأ أثناء إضافة النقاط" }
    revalidatePath(`/teacher/group/${groupId}/ranking`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إضافة النقاط" }
  }
}
