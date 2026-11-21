/**
 * NextAuth v4 configuration.
 *
 * All types are fully inferred from the augmented interfaces in
 * src/shared/types/nextauth.d.ts — no `as unknown` casts needed.
 */
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginApi } from "@/features/auth/apis/auth.api"
import { sessionMaxAge } from "@/shared/constant/auth.constant"
import { resolveId } from "@/shared/types/api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        try {
          const { token, user } = await loginApi({ email, password })
          // Shape matches the augmented User interface: { id, token, user }
          return { id: resolveId(user), token, user }
        } catch (err: unknown) {
          // Throwing causes NextAuth to populate signIn()'s `error` response field
          throw new Error(
            (err as Error)?.message ?? "بيانات الدخول غير صحيحة"
          )
        }
      },
    }),
  ],

  callbacks: {
    // On first sign-in `user` carries { id, token, user } — persist into JWT
    jwt({ token, user }) {
      if (user) {
        token.token = user.token
        token.user  = user.user
        token.role  = user.user.role
      }
      return token
    },

    // Expose token + user to useSession() / getSession() on the client
    session({ session, token }) {
      session.token = token.token
      session.user  = token.user
      return session
    },
  },

  session: {
    strategy: "jwt",
    maxAge:   sessionMaxAge,
  },

  jwt: {
    maxAge: sessionMaxAge,
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionMaxAge,
      },
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  secret: process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET,
}
