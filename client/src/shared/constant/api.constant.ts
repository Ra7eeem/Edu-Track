/**
 * Shared API Constants
 * Follows Rose-App architecture for standardized headers & endpoints
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

export const BASE_API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"

