import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import type {
  ApiResponse,
  ApiDailyQuestion,
  ApiDailyAnswerResult,
} from "@/shared/types/api"

async function getAuthHeader() {
  const token = await getNextAuthToken()
  return token?.token ? HEADERS.authorize(token.token) : {}
}

export async function getTodayQuestionApi(
  classroomId: string
): Promise<ApiDailyQuestion | null> {
  const authHeader = await getAuthHeader()
  const res = await fetch(
    `${BASE_API_URL}/api/daily-questions/today?classroomId=${classroomId}`,
    {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...authHeader,
      },
      cache: "no-store",
    }
  )

  const json: ApiResponse<ApiDailyQuestion | null> = await res.json()
  if (!res.ok || !json.success) {
    return null
  }
  return json.data
}

export async function answerDailyQuestionApi(
  questionId: string,
  selectedOptionIndex: number
): Promise<ApiDailyAnswerResult> {
  const authHeader = await getAuthHeader()
  const res = await fetch(`${BASE_API_URL}/api/daily-questions/${questionId}/answer`, {
    method: "POST",
    headers: {
      ...HEADERS.JsonBody,
      ...authHeader,
    },
    body: JSON.stringify({ selectedOptionIndex }),
  })

  const json: ApiResponse<ApiDailyAnswerResult> = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تسجيل الإجابة")
  }
  return json.data
}
