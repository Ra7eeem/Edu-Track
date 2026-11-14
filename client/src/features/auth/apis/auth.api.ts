/**
 * Authentication API Service
 * Follows Rose-App architecture: pure native fetch functions, strongly typed.
 */
import { HEADERS, BASE_API_URL } from "@/shared/constant/api.constant"
import { ApiResponse } from "@/shared/types/api"
import type {
  LoginCredentials,
  LoginResponse,
  PublicGroup,
  RegisterStudentPayload,
  RegisterStudentResponse,
} from "../types/auth"

export async function loginApi(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const res = await fetch(`${BASE_API_URL}/api/auth/login`, {
    method: "POST",
    headers: HEADERS.JsonBody,
    body: JSON.stringify(credentials),
    cache: "no-store",
  })

  const json: ApiResponse<LoginResponse> = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل تسجيل الدخول")
  }

  return json.data
}

export async function registerStudentApi(
  payload: RegisterStudentPayload
): Promise<RegisterStudentResponse> {
  const res = await fetch(`${BASE_API_URL}/api/auth/register/student`, {
    method: "POST",
    headers: HEADERS.JsonBody,
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const json: ApiResponse<RegisterStudentResponse> = await res.json()

  if (!res.ok || !json.success) {
    throw new Error(json.message || "فشل إنشاء الحساب")
  }

  return json.data
}

/**
 * Fetches public groups available for a specific grade.
 * Cached for 5 minutes to reduce unnecessary database requests during registration.
 */
export async function getGroupsByGradeApi(grade: string): Promise<PublicGroup[]> {
  try {
    const res = await fetch(
      `${BASE_API_URL}/api/auth/groups?grade=${encodeURIComponent(grade)}`,
      {
        headers: HEADERS.JsonBody,
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!res.ok) return []

    const json = await res.json()
    if (!json) return []
    if (Array.isArray(json)) return json
    if (json.data && Array.isArray(json.data)) return json.data
    return []
  } catch {
    return []
  }
}

