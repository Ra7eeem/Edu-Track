import { ApiUser } from "@/shared/types/api"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider`
   */
  interface User {
    id: string
    token: string
    user: ApiUser
  }

  interface Session {
    token?: string
    user?: ApiUser
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    token?: string
    user?: ApiUser
  }
}

