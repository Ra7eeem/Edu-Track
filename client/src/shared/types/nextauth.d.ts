/**
 * NextAuth type augmentations.
 * Extends the built-in NextAuth types with our ApiUser and token fields
 * so the session, JWT, and authorize() return type are all fully typed
 * without any `as unknown as User` casts.
 */
import { ApiUser } from "@/shared/types/api"

declare module "next-auth" {
  /**
   * What `authorize()` must return and what appears in JWT callback's `user`.
   * id   — required by NextAuth (string)
   * token — backend JWT
   * user  — full ApiUser payload
   */
  interface User {
    id:    string
    token: string
    user:  ApiUser
  }

  /**
   * Shape returned by `useSession()` / `getSession()`.
   */
  interface Session {
    /** Backend JWT token */
    token: string
    /** Authenticated user (ApiUser replaces the default minimal user shape) */
    user:  ApiUser
  }
}

declare module "next-auth/jwt" {
  /**
   * Shape of the JWT stored in the cookie.
   * Returned by the `jwt` callback and by `getToken()`.
   */
  interface JWT {
    /** Backend JWT token */
    token: string
    /** Full ApiUser payload */
    user:  ApiUser
  }
}
