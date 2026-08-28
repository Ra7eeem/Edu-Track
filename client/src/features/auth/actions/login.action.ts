"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { getSession } from "@/shared/lib/session"
import { LoginResponse, Role } from "@/shared/types/api"
import { redirect } from "next/navigation"
import { loginSchema, type LoginFormValues } from "../schemas/login.schema"

export type LoginActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
}

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  // 1. Validate
  const raw = {
    email:    formData.get("email")    as string,
    password: formData.get("password") as string,
  }
  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  // 2. Call API
  let result: LoginResponse
  try {
    result = await serverFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body:   parsed.data,
      token:  "", // no token needed for login
    })
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء تسجيل الدخول" }
  }

  // 3. Persist session
  const session = await getSession()
  session.token      = result.token
  session.userId     = result.user.id
  session.role       = result.user.role
  session.name       = result.user.name
  session.email      = result.user.email
  session.avatarUrl  = result.user.avatarUrl
  session.grade      = result.user.grade
  session.isLoggedIn = true
  await session.save()

  // 4. Redirect based on role
  const dest =
    result.user.role === Role.ADMIN   ? "/admin/dashboard"
    : result.user.role === Role.TEACHER ? "/teacher/dashboard"
    : "/student/dashboard"

  redirect(dest)
}

// Also export a direct function for programmatic use (e.g. from client)
export async function loginDirect(values: LoginFormValues): Promise<LoginActionState> {
  const fd = new FormData()
  fd.set("email",    values.email)
  fd.set("password", values.password)
  return loginAction({}, fd)
}
