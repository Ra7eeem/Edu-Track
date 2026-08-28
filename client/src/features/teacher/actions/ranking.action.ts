"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { revalidatePath } from "next/cache"

export type RankingActionState = { success?: boolean; error?: string }

export async function resetRankingAction(
  groupId: string,
  month:   number,
  year:    number
): Promise<RankingActionState> {
  try {
    await serverFetch(
      `/api/groups/${groupId}/ranking/reset?month=${month}&year=${year}`,
      { method: "POST" }
    )
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
  try {
    await serverFetch(
      `/api/groups/${groupId}/ranking/students/${studentId}/bonus?month=${month}&year=${year}`,
      { method: "POST", body: { bonus } }
    )
    revalidatePath(`/teacher/group/${groupId}/ranking`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إضافة النقاط" }
  }
}
