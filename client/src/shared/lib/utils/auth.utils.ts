import { decode } from "next-auth/jwt"
import { cookies } from "next/headers"

/**
 * Server-side helper to decode and get NextAuth JWT token.
 * Follows Rose-App pattern.
 */
export async function getNextAuthToken() {
  const cookieStore = await cookies()
  const token =
    cookieStore.get("next-auth.session-token")?.value ??
    cookieStore.get("__Secure-next-auth.session-token")?.value

  if (!token) return null

  try {
    const jwt = await decode({
      token,
      secret: (process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET)!,
    })
    return jwt?.token ? jwt : null
  } catch {
    return null
  }
}
