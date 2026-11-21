import { authOptions } from "@/auth"
import { getServerSession } from "next-auth"
import { resolveId, SessionData } from "@/shared/types/api"

/**
 * Retrieves the current authenticated user's session data on the server using NextAuth.
 * Simple, clean, and fully typed.
 */
export async function getSessionData(): Promise<SessionData | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !session.token) {
    return null
  }

  const { user, token } = session
  return {
    token,
    userId: resolveId(user),
    role: user.role,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    grade: user.grade ?? null,
    isLoggedIn: true,
  }
}

/**
 * Helper to get the raw NextAuth session.
 */
export async function getAuthSession() {
  return getServerSession(authOptions)
}

/**
 * Helper to get only the JWT token on the server.
 */
export async function getAuthToken(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.token ?? null
}
