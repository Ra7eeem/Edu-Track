/**
 * Client-side API client — used in React Query hooks & client components.
 * Token is fetched once from /api/session and cached in memory.
 */
import axios, { AxiosError, AxiosRequestConfig } from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
})

// ─── Token cache ──────────────────────────────────────────────────────────────
let cachedToken: string | null = null
let tokenFetchedAt  = 0
const TOKEN_TTL_MS  = 5 * 60 * 1000 // re-fetch every 5 min

async function getToken(): Promise<string | null> {
  const now = Date.now()
  if (cachedToken && now - tokenFetchedAt < TOKEN_TTL_MS) {
    return cachedToken
  }
  try {
    // Build absolute URL so it works on Vercel (client-side window.location)
    const base = typeof window !== "undefined"
      ? `${window.location.origin}`
      : process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? ""

    const res  = await fetch(`${base}/api/session`, {
      cache:       "no-store",
      credentials: "include",
    })
    if (!res.ok) return null
    const json = await res.json()
    cachedToken    = json.token ?? null
    tokenFetchedAt = now
    return cachedToken
  } catch {
    return null
  }
}

/** Call this after login/logout to bust the cache */
export function clearTokenCache() {
  cachedToken    = null
  tokenFetchedAt = 0
}

// ─── Request interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers["Authorization"] = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ success: false; message: string; code?: string; errors?: Record<string, string[]> }>) => {
    // Token may have expired — bust cache on 401
    if (err.response?.status === 401) {
      clearTokenCache()
    }
    const data = err.response?.data
    return Promise.reject({
      status:  err.response?.status ?? 0,
      message: data?.message ?? "حدث خطأ في الاتصال",
      code:    data?.code    ?? "NETWORK_ERROR",
      errors:  data?.errors,
    })
  }
)

// ─── clientFetch ──────────────────────────────────────────────────────────────
export type ClientApiError = {
  status:  number
  message: string
  code:    string
  errors?: Record<string, string[]>
}

export async function clientFetch<T>(
  path: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await apiClient.request<{ success: true; data: T } | T>({
    url: path,
    ...config,
  })

  // 204 No Content
  if (res.status === 204 || res.data === undefined || res.data === null) {
    return undefined as T
  }

  // Standard wrapper: { success: true, data: ... }
  if (
    typeof res.data === "object" &&
    res.data !== null &&
    "success" in (res.data as object) &&
    "data"    in (res.data as object)
  ) {
    return (res.data as { success: true; data: T }).data
  }

  // Plain array or object
  return res.data as T
}
