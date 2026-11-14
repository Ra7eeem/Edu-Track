"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { getSession } from "@/shared/lib/session"
import { ApiResponse, ApiUser } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateProfileSchema = z.object({
  name:  z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
})

export type ProfileActionState = {
  error?:   string
  success?: boolean
}

export async function updateTeacherProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const raw = {
    name:  formData.get("name")  as string | undefined,
    phone: formData.get("phone") as string | undefined,
  }
  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/teacher/profile`, {
      method: "PATCH",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(parsed.data),
    })
    const json: ApiResponse<ApiUser> = await res.json()
    if (!res.ok || !json.success) return { error: json.message || "حدث خطأ" }

    // Update iron-session if present
    try {
      const session = await getSession()
      if (session.isLoggedIn && json.data?.name) {
        session.name = json.data.name
        await session.save()
      }
    } catch {
      // ignore
    }

    revalidatePath("/teacher/profile")
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ" }
  }
}
