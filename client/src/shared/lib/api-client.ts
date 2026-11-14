/**
 * Client-side API client — native fetch (NO AXIOS).
 * Token is fetched once from /api/session and cached in memory.
 * Follows clean, performant fetch pattern.
 */
import { HEADERS, BASE_API_URL } from "@/shared/constant/api.constant"

// ─── Token cache ──────────────────────────────────────────────────────────────
let cachedToken: string | null = null
let tokenFetchedAt = 0
const TOKEN_TTL_MS = 5 * 60 * 1000 // re-fetch every 5 min

async function getToken(): Promise<string | null> {
  const now = Date.now()
  if (cachedToken && now - tokenFetchedAt < TOKEN_TTL_MS) {
    return cachedToken
  }
  try {
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ""

    const res = await fetch(`${base}/api/session`, {
      cache: "no-store",
      credentials: "include",
    })
    if (!res.ok) return null
    const json = await res.json()
    cachedToken = json.token ?? null
    tokenFetchedAt = now
    return cachedToken
  } catch {
    return null
  }
}

/** Call this after login/logout to bust the cache */
export function clearTokenCache() {
  cachedToken = null
  tokenFetchedAt = 0
}

// ─── Types & Client Fetch ─────────────────────────────────────────────────────
export type ClientApiError = {
  status: number
  message: string
  code: string
  errors?: Record<string, string[]>
}

export interface ClientFetchConfig extends Omit<RequestInit, "body"> {
  data?: unknown
  body?: BodyInit | null
  params?: Record<string, string | number | boolean | undefined>
  headers?: HeadersInit
}

export async function clientFetch<T>(
  path: string,
  config?: ClientFetchConfig
): Promise<T> {
  const token = await getToken()

  // Build query string if params are provided
  let url = path.startsWith("http") ? path : `${BASE_API_URL}${path}`
  if (config?.params) {
    const searchParams = new URLSearchParams()
    Object.entries(config.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val))
      }
    })
    const qs = searchParams.toString()
    if (qs) {
      url += (url.includes("?") ? "&" : "?") + qs
    }
  }

  const headers: Record<string, string> = {
    ...HEADERS.JsonBody,
    ...(token ? HEADERS.authorize(token) : {}),
    ...((config?.headers as Record<string, string>) || {}),
  }

  // Handle body: config.data or config.body
  let bodyPayload: BodyInit | undefined = undefined
  if (config?.data !== undefined) {
    bodyPayload = JSON.stringify(config.data)
  } else if (config?.body !== undefined && config?.body !== null) {
    bodyPayload = config.body
  }

  const res = await fetch(url, {
    ...config,
    method: config?.method ?? "GET",
    headers,
    body: bodyPayload,
  })

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T
  }

  // Token might have expired
  if (res.status === 401) {
    clearTokenCache()
  }

  let json: { success?: boolean; data?: T; message?: string; code?: string; errors?: Record<string, string[]> }
  try {
    json = await res.json()
  } catch {
    if (!res.ok) {
      throw {
        status: res.status,
        message: "حدث خطأ في الاتصال بالخادم",
        code: "NETWORK_ERROR",
      } satisfies ClientApiError
    }
    return undefined as unknown as T
  }

  if (!res.ok || json.success === false) {
    throw {
      status: res.status,
      message: json.message ?? "حدث خطأ في الاتصال",
      code: json.code ?? "API_ERROR",
      errors: json.errors,
    } satisfies ClientApiError
  }

  // Standard wrapper: { success: true, data: ... }
  if (
    typeof json === "object" &&
    json !== null &&
    "success" in json &&
    "data" in json
  ) {
    return json.data as T
  }

  return json as unknown as T
}
