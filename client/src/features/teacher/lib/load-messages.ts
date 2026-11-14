import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { ApiAnonymousMessage, ApiResponse, PaginatedResponse } from "@/shared/types/api"

export async function loadTeacherMessages(): Promise<ApiAnonymousMessage[]> {
  const token = await getNextAuthToken()
  if (!token?.token) return []

  try {
    const res = await fetch(`${BASE_API_URL}/api/anonymous/inbox?limit=100`, {
      method: "GET",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      cache: "no-store",
    })

    const json: ApiResponse<PaginatedResponse<ApiAnonymousMessage> | ApiAnonymousMessage[]> = await res.json()
    if (!res.ok || json.success === false) return []
    return toPaginatedArray(json.data ?? json)
  } catch {
    return []
  }
}
