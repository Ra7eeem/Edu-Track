/**
 * Auth API service
 * Native fetch only — no axios.
 * Follows Rose-App architecture: pure functions, strongly typed.
 */
import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import type { ApiResponse, LoginResponse, RegisterStudentResponse } from "@/shared/types/api"
import type { LoginCredentials, PublicGroup, RegisterStudentPayload } from "../types/auth"

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${BASE_API_URL}/api/auth/login`, {
    method:  "POST",
    headers: HEADERS.JsonBody,
    body:    JSON.stringify(credentials),
    cache:   "no-store",
  })

  const json: ApiResponse<LoginResponse> = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تسجيل الدخول")
  }

  return json.data
}

// ─── Register student ─────────────────────────────────────────────────────────

export async function registerStudentApi(
  payload: RegisterStudentPayload
): Promise<RegisterStudentResponse> {
  const res = await fetch(`${BASE_API_URL}/api/auth/register/student`, {
    method:  "POST",
    headers: HEADERS.JsonBody,
    body:    JSON.stringify(payload),
    cache:   "no-store",
  })

  const json: ApiResponse<RegisterStudentResponse> = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل إنشاء الحساب")
  }

  return json.data
}

// ─── Public groups (for registration grade picker) ────────────────────────────

/**
 * Fetches groups visible to the given grade.
 * Cached 5 minutes — multiple grade changes during registration won't hammer the API.
 */
export async function getGroupsByGradeApi(grade: string): Promise<PublicGroup[]> {
  try {
    const res = await fetch(
      `${BASE_API_URL}/api/auth/groups?grade=${encodeURIComponent(grade)}`,
      {
        headers: HEADERS.JsonBody,
        next:    { revalidate: 300 },
      }
    )

    if (!res.ok) return []

    const json = await res.json()
    if (!json)                               return []
    if (Array.isArray(json))                 return json
    if (json.data && Array.isArray(json.data)) return json.data
    return []
  } catch {
    return []
  }
}
