"use server"

import { redirect } from "next/navigation"
import { registerStudentApi } from "../apis/auth.api"
import { registerStudentSchema } from "../schemas/register.schema"
import type { AuthActionState } from "../types/auth"

export type RegisterActionState = AuthActionState

export async function registerStudentAction(
  _prev: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    phone: formData.get("phone") as string,
    grade: formData.get("grade") as string,
    groupId: formData.get("groupId") as string,
  }

  const parsed = registerStudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  try {
    await registerStudentApi(parsed.data)
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إنشاء الحساب" }
  }

  redirect("/login?registered=true")
}
