/**
 * Server-side API client — used in Server Components & Server Actions.
 * Reads the token from iron-session automatically.
 */
import { getSessionData } from "./session"
import { PaginatedResponse } from "@/shared/types/api"

const BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

interface FetchOptions {
  method?:  HttpMethod
  body?:    unknown
  token?:   string
  revalidate?: number | false
  tags?:    string[]
}

export class ApiServerError extends Error {
  constructor(
    public status:  number,
    public code:    string,
    message:        string,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = "ApiServerError"
  }
}

export async function serverFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = "GET", body, token: overrideToken, revalidate, tags } = options

  let token = overrideToken
  if (token === undefined) {
    const session = await getSessionData()
    token = session?.token
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept:         "application/json",
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const nextOpts: Record<string, unknown> = {}
  if (revalidate !== undefined) nextOpts.revalidate = revalidate
  else nextOpts.revalidate = 0
  if (tags) nextOpts.tags = tags

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    next: nextOpts as RequestInit["next"],
  })

  const json = await res.json()

  if (!res.ok || json.success === false) {
    throw new ApiServerError(
      res.status,
      json.code ?? "UNKNOWN",
      json.message ?? "حدث خطأ غير متوقع",
      json.errors
    )
  }

  return (json as { success: true; data: T }).data
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
