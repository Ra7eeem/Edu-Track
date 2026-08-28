import { getIronSession } from "iron-session"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { SESSION_OPTIONS } from "@/shared/lib/session"
import { SessionData, Role } from "@/shared/types/api"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"]
const AUTH_PATHS   = ["/login", "/register"]

// Role → allowed path prefixes
const ROLE_PATHS: Record<Role, string> = {
  [Role.ADMIN]:   "/admin",
  [Role.TEACHER]: "/teacher",
  [Role.STUDENT]: "/student",
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const res     = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, SESSION_OPTIONS)

  const isLoggedIn = !!session.isLoggedIn

  // If visiting auth pages while logged in → redirect to dashboard
  if (isLoggedIn && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    const dest = ROLE_PATHS[session.role] + "/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Public paths are always accessible
  if (PUBLIC_PATHS.includes(pathname)) return res

  // Protected: must be logged in
  if (!isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  const allowedPrefix = ROLE_PATHS[session.role]
  if (!pathname.startsWith(allowedPrefix)) {
    const dest = allowedPrefix + "/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
