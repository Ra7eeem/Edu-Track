"use server"

import { getSession } from "@/shared/lib/session"
import { Role, resolveId } from "@/shared/types/api"
import { redirect } from "next/navigation"
import { loginApi } from "../apis/auth.api"
import { loginSchema } from "../schemas/login.schema"
import type { AuthActionState } from "../types/auth"

export type LoginActionState = AuthActionState

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let result
  try {
    result = await loginApi(parsed.data)
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء تسجيل الدخول" }
  }

  const session = await getSession()
  session.token = result.token
  session.userId = resolveId(result.user)
  session.role = result.user.role
  session.name = result.user.name
  session.email = result.user.email
  session.avatarUrl = result.user.avatarUrl ?? null
  session.grade = result.user.grade ?? null
  session.isLoggedIn = true
  await session.save()

  const dest =
    result.user.role === Role.ADMIN
      ? "/admin/dashboard"
      : result.user.role === Role.TEACHER
      ? "/teacher/dashboard"
      : "/student/dashboard"

  redirect(dest)
}
