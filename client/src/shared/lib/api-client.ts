/**
 * Client-side API client — used in React Query hooks & client components.
 * Reads the token from a public /api/session route handler.
 */
import axios, { AxiosError, AxiosRequestConfig } from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
})

// Attach token from the session API route on every request
apiClient.interceptors.request.use(async (config) => {
  try {
    const res  = await fetch("/api/session", { cache: "no-store" })
    const json = await res.json()
    if (json.token) {
      config.headers = config.headers ?? {}
      config.headers["Authorization"] = `Bearer ${json.token}`
    }
  } catch {
    // no session — unauthenticated request
  }
  return config
})

// Normalize errors
apiClient.interceptors.response.use(
  (r) => r,
  (err: AxiosError<{ success: false; message: string; code?: string; errors?: Record<string, string[]> }>) => {
    const data = err.response?.data
    return Promise.reject({
      status:  err.response?.status ?? 0,
      message: data?.message ?? "حدث خطأ في الاتصال",
      code:    data?.code ?? "NETWORK_ERROR",
      errors:  data?.errors,
    })
  }
)

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
  console.log(path)
  const res = await apiClient.request<{ success: true; data: T }>({
    url: path,
    ...config,
  })
  return res.data.data
}
