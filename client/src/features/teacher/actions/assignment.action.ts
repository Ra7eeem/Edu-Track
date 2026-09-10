"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiAssignment } from "@/shared/types/api"
import { revalidatePath, updateTag } from "next/cache"
import { z } from "zod"

const idSchema = z.object({
  assignmentId: z.string().min(1),
  groupId:      z.string().min(1),
})

export type AssignmentToggleState =
  | { success: true; data: ApiAssignment }
  | { error: string }

function revalidateAssignmentViews(groupId: string) {
  updateTag(`student-assignments-${groupId}`)
  revalidatePath("/student/assignments", "layout")
  revalidatePath("/student/exams", "layout")
  revalidatePath(`/teacher/group/${groupId}/assignments`)
}

export async function toggleAssignmentResultsAction(
  assignmentId: string,
  groupId:      string
): Promise<AssignmentToggleState> {
  const parsed = idSchema.safeParse({ assignmentId, groupId })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  try {
    const data = await serverFetch<ApiAssignment>(
      `/api/assignments/${assignmentId}/toggle-results`,
      { method: "PATCH" }
    )
    revalidateAssignmentViews(groupId)
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}

export async function toggleAssignmentVisibilityAction(
  assignmentId: string,
  groupId:      string
): Promise<AssignmentToggleState> {
  const parsed = idSchema.safeParse({ assignmentId, groupId })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  try {
    const data = await serverFetch<ApiAssignment>(
      `/api/assignments/${assignmentId}/toggle-visibility`,
      { method: "PATCH" }
    )
    revalidateAssignmentViews(groupId)
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}
