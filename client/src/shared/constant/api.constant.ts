/**
 * Shared API Constants
 * Standardized headers & endpoints with robust environment resolution
 */

export const HEADERS = {
  JsonBody: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  authorize: (token: string) => ({
    Authorization: `Bearer ${token}`,
  }),
} as const

export function getBaseApiUrl(): string {
  if (typeof window !== "undefined") {
    // In browser: if not on localhost, do not use localhost:5000 fallback
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1"

    const configured = process.env.NEXT_PUBLIC_API_URL

    if (!isLocalhost) {
      if (!configured || configured.includes("localhost") || configured.includes("127.0.0.1")) {
        return window.location.origin
      }
    }
    return configured || window.location.origin
  }

  // Server-side
  if (process.env.API_URL && !process.env.API_URL.includes("localhost") && !process.env.API_URL.includes("127.0.0.1")) {
    return process.env.API_URL
  }
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost") && !process.env.NEXT_PUBLIC_API_URL.includes("127.0.0.1")) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
}

export const BASE_API_URL = getBaseApiUrl()
