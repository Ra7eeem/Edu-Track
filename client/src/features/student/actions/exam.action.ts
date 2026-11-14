"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiExamSubmission, ApiResponse } from "@/shared/types/api"
import { revalidatePath, updateTag } from "next/cache"
import { submitExamSchema } from "../schemas/student.schema"

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

  const token = await getNextAuthToken()
  if (!token?.token) {
    return { success: false, error: "غير مصرح لك بتسليم الامتحان، يرجى تسجيل الدخول" }
  }

  try {
    const res = await fetch(`${BASE_API_URL}/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ answers: parsed.data.answers }),
    })

    const json: ApiResponse<ApiExamSubmission> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "حدث خطأ أثناء تسليم الامتحان" }
    }

    revalidatePath(`/student/exams/${assignmentId}`, "layout")
    revalidatePath("/student/exams")
    if (groupId) updateTag(`student-assignments-${groupId}`)
    return { success: true, data: json.data }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? "حدث خطأ أثناء تسليم الامتحان" }
  }
}
