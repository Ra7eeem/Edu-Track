import { getIronSession, IronSession } from "iron-session"
import { cookies } from "next/headers"
import { SessionData, Role, resolveId } from "@/shared/types/api"
import { getAuthSession, getNextAuthToken } from "./utils/auth.utils"

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "edu_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS)
}

export async function getSessionData(): Promise<SessionData | null> {
  // 1. Check NextAuth session first
  const nextAuthSession = await getAuthSession()
  if (nextAuthSession?.user && nextAuthSession.token) {
    const user = nextAuthSession.user
    return {
      token: nextAuthSession.token,
      userId: resolveId(user),
      role: user.role,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      grade: user.grade ?? null,
      isLoggedIn: true,
    }
  }

  // 1.1 Check NextAuth JWT directly
  const nextAuthJwt = await getNextAuthToken()
  if (nextAuthJwt?.token && nextAuthJwt.user) {
    const user = nextAuthJwt.user as unknown as {
      role: Role
      name: string
      email: string
      avatarUrl?: string | null
      grade?: any
      id?: string
      _id?: string
    }
    return {
      token: nextAuthJwt.token as string,
      userId: resolveId(user),
      role: user.role,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? null,
      grade: user.grade ?? null,
      isLoggedIn: true,
    }
  }

  // 2. Fallback to iron-session
  const session = await getSession()
  if (!session.isLoggedIn) return null
  return session as SessionData
}

export { SESSION_OPTIONS }
