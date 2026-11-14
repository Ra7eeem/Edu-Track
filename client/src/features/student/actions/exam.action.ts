"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiExamSubmission } from "@/shared/types/api"
import { revalidatePath, updateTag } from "next/cache"
import { submitExamSchema } from "../schemas/student.schema"
import type { StudentActionResult } from "../types/student"

export type SubmitExamState =
  | { success: true; data: ApiExamSubmission }
  | { success?: false; error: string }

export async function submitExamAction(
  assignmentId: string,
  answers: { questionId: string; chosen: string }[],
  groupId?: string
): Promise<SubmitExamState> {
  const parsed = submitExamSchema.safeParse({ assignmentId, answers, groupId })
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" }
  }

  try {
    const data = await serverFetch<ApiExamSubmission>(
      `/api/assignments/${assignmentId}/submit`,
      {
        method: "POST",
        body: { answers: parsed.data.answers },
      }
    )
    revalidatePath(`/student/exams/${assignmentId}`, "layout")
    revalidatePath("/student/exams")
    if (groupId) updateTag(`student-assignments-${groupId}`)
    return { success: true, data }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? "حدث خطأ أثناء تسليم الامتحان" }
  }
}
