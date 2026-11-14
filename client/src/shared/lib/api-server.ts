/**
 * Server-side API client — used in Server Components & Server Actions.
 * Reads the token from iron-session automatically.
 * Native fetch implementation following Rose-App pattern.
 */
import { getSessionData } from "./session"
import { HEADERS, BASE_API_URL } from "@/shared/constant/api.constant"
import { PaginatedResponse } from "@/shared/types/api"

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export interface ServerFetchOptions {
  method?: HttpMethod
  body?: unknown
  token?: string
  revalidate?: number | false
  tags?: string[]
  headers?: Record<string, string>
}

export class ApiServerError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiServerError"
  }
}

export async function serverFetch<T>(
  path: string,
  options: ServerFetchOptions = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    token: overrideToken,
    revalidate,
    tags,
    headers: extraHeaders = {},
  } = options

  let token = overrideToken
  if (token === undefined) {
    const session = await getSessionData()
    token = session?.token
  }

  const headers: Record<string, string> = {
    ...HEADERS.JsonBody,
    ...(token ? HEADERS.authorize(token) : {}),
    ...extraHeaders,
  }

  const nextOpts: Record<string, unknown> = {}
  if (revalidate !== undefined) nextOpts.revalidate = revalidate
  else nextOpts.revalidate = 0
  if (tags) nextOpts.tags = tags

  const res = await fetch(`${BASE_API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    next: nextOpts as RequestInit["next"],
  })

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T
  }

  let json: { success?: boolean; data?: T; message?: string; code?: string; errors?: Record<string, string[]> }
  try {
    json = await res.json()
  } catch {
    throw new ApiServerError(
      res.status,
      "INVALID_JSON",
      `استجابة غير صالحة من الخادم (${res.status})`
    )
  }

  if (!res.ok || json.success === false) {
    throw new ApiServerError(
      res.status,
      json.code ?? "UNKNOWN",
      json.message ?? "حدث خطأ غير متوقع",
      json.errors
    )
  }

  return (json.data !== undefined ? json.data : (json as unknown as T))
}

/**
 * Safely extract an array from a settled Promise result.
 * Handles both PaginatedResponse<T> and plain T[] shapes.
 */
export function resolveList<T>(
  result: PromiseSettledResult<PaginatedResponse<T> | T[] | null>
): T[] {
  if (result.status !== "fulfilled" || !result.value) return []
  const val = result.value
  if (Array.isArray(val)) return val
  if ("data" in val && Array.isArray(val.data)) return val.data
  return []
}

/**
 * Safely extract a single value from a settled Promise result.
 */
export function resolveOne<T>(
  result: PromiseSettledResult<T | null>,
  fallback: T
): T {
  return result.status === "fulfilled" && result.value !== null
    ? result.value
    : fallback
}
