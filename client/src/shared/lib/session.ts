import { getIronSession, IronSession } from "iron-session"
import { cookies } from "next/headers"
import { SessionData } from "@/shared/types/api"

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
  const session = await getSession()
  if (!session.isLoggedIn) return null
  return session as SessionData
}

export { SESSION_OPTIONS }
