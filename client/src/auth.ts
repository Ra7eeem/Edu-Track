import { NextAuthOptions, Session, User } from "next-auth"
import { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import { loginApi } from "./features/auth/apis/auth.api"
import { sessionMaxAge } from "./shared/constant/auth.constant"
import { ApiUser, resolveId } from "./shared/types/api"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        try {
          const loginData = await loginApi({
            email: credentials.email,
            password: credentials.password,
          })
          if (!loginData?.token || !loginData?.user) {
            return null
          }
          return {
            id: resolveId(loginData.user),
            token: loginData.token,
            user: loginData.user,
          } as unknown as User
        } catch (err: unknown) {
          const message = (err as Error)?.message || "بيانات الدخول غير صحيحة"
          throw new Error(message)
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }: { token: JWT; user?: User }) => {
      if (user) {
        const u = user as unknown as { token: string; user: ApiUser }
        token.token = u.token
        token.user = u.user
      }
      return token
    },
    session: async ({ session, token }: { session: Session; token: JWT }) => {
      if (token.user) {
        session.user = token.user
      }
      if (token.token) {
        session.token = token.token
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
    maxAge: sessionMaxAge,
  },
  jwt: {
    maxAge: sessionMaxAge,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.SESSION_SECRET,
}

