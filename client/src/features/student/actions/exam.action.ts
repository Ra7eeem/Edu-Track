"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiExamSubmission } from "@/shared/types/api"
import { revalidatePath, updateTag } from "next/cache"
import { z } from "zod"

const submitExamSchema = z.object({
  assignmentId: z.string().min(1),
  groupId:      z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string().min(1),
    chosen:     z.string().min(1),
  })),
})

export type SubmitExamState =
  | { success: true; data: ApiExamSubmission }
  | { error: string }

export async function submitExamAction(
  assignmentId: string,
  answers:      { questionId: string; chosen: string }[],
  groupId?:     string
): Promise<SubmitExamState> {
  const parsed = submitExamSchema.safeParse({ assignmentId, answers, groupId })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  try {
    const data = await serverFetch<ApiExamSubmission>(`/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      body:   { answers: parsed.data.answers },
    })
    revalidatePath(`/student/exams/${assignmentId}`, "layout")
    revalidatePath("/student/exams")
    if (groupId) updateTag(`student-assignments-${groupId}`)
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ أثناء التسليم" }
  }
}
