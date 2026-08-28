"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { getSession } from "@/shared/lib/session"
import { RegisterStudentResponse, Role, resolveId } from "@/shared/types/api"
import { redirect } from "next/navigation"
import { registerStudentSchema } from "../schemas/register.schema"

export type RegisterActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
  message?: string
}

export async function registerStudentAction(
  _prev: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  const raw = {
    name:     formData.get("name")     as string,
    email:    formData.get("email")    as string,
    password: formData.get("password") as string,
    phone:    formData.get("phone")    as string,
    grade:    formData.get("grade")    as string,
    groupId:  formData.get("groupId")  as string,
  }

  const parsed = registerStudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let result: RegisterStudentResponse
  try {
    result = await serverFetch<RegisterStudentResponse>(
      "/api/auth/register/student",
      { method: "POST", body: parsed.data, token: "" }
    )
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إنشاء الحساب" }
  }

  const session      = await getSession()
  session.token      = result.token
  session.userId     = resolveId(result.user)       // handles _id OR id
  session.role       = Role.STUDENT
  session.name       = result.user.name
  session.email      = result.user.email
  session.avatarUrl  = null
  session.grade      = result.user.grade ?? null
  session.isLoggedIn = true
  await session.save()

  redirect("/student/dashboard")
}
