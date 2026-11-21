import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { Role } from "@/shared/types/api"

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"]
const REDIRECT_WHEN_LOGGED_IN = ["/", "/login", "/register", "/forgot-password"]

// Role → allowed path prefixes
const ROLE_PATHS: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
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

  const res = NextResponse.next()

  // 1. Check NextAuth JWT
  const nextAuthToken = await getToken({
    req,
    secret: (process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET)!,
  })

  let isLoggedIn = false
  let userRole: Role | undefined

  if (nextAuthToken) {
    const role = (nextAuthToken.user?.role ?? (nextAuthToken as any).role) as Role | undefined
    if (role && ROLE_PATHS[role]) {
      isLoggedIn = true
      userRole = role
    }
  }

  // If user is already logged in with token, immediately redirect to their role's dashboard
  const isAuthOrRootPath =
    pathname === "/" ||
    REDIRECT_WHEN_LOGGED_IN.some(
      (p) => p !== "/" && (pathname === p || pathname.startsWith(p + "/"))
    )

  if (isLoggedIn && userRole && isAuthOrRootPath) {
    const dest = ROLE_PATHS[userRole] + "/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  // Public paths are accessible to unauthenticated visitors
  if (PUBLIC_PATHS.includes(pathname)) return res

  // Protected: must be logged in
  if (!isLoggedIn || !userRole) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  const allowedPrefix = ROLE_PATHS[userRole]
  if (!pathname.startsWith(allowedPrefix)) {
    const dest = allowedPrefix + "/dashboard"
    return NextResponse.redirect(new URL(dest, req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
