import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"
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

  if (token) {
    try {
      const jwt = await decode({
        token,
        secret: (process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET)!,
      })
      if (jwt?.token) return jwt
    } catch {
      // ignore decode error and try fallback
    }
  }

  // Fallback to iron-session cookie if NextAuth token is not found
  const ironCookie = cookieStore.get("edu_session")?.value
  if (ironCookie) {
    try {
      const { getIronSession } = await import("iron-session")
      const session = await getIronSession<any>(cookieStore, {
        password: (process.env.SESSION_SECRET ?? process.env.NEXTAUTH_SECRET)!,
        cookieName: "edu_session",
      })
      if (session?.token) {
        return {
          token: session.token as string,
          user: session,
        } as any
      }
    } catch {
      // ignore
    }
  }

  return null
}

/**
 * Server-side helper to get the full NextAuth session.
 */
export async function getAuthSession() {
  try {
    return await getServerSession(authOptions)
  } catch {
    return null
  }
}
