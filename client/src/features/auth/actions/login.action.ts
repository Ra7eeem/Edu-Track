"use server"

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

  try {
    await loginApi(parsed.data)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء تسجيل الدخول" }
  }
}
