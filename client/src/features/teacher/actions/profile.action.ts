"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { getSession } from "@/shared/lib/session"
import { ApiUser } from "@/shared/types/api"
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

  try {
    const updated = await serverFetch<ApiUser>("/api/teacher/profile", {
      method: "PATCH",
      body:   parsed.data,
    })
    // Update session name
    const session = await getSession()
    session.name = updated.name
    await session.save()
    revalidatePath("/teacher/profile")
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ" }
  }
}
