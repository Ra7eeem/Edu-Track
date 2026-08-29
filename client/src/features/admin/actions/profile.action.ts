"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { getSession } from "@/shared/lib/session"
import { ApiUser } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateSchema = z.object({
  name:        z.string().min(2, "الاسم حرفان على الأقل").optional(),
  phone:       z.string().min(7, "رقم هاتف غير صالح").optional(),
  oldPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8, "كلمة المرور 8 أحرف على الأقل").optional(),
}).refine(d => !(d.newPassword && !d.oldPassword), {
  message: "يجب إدخال كلمة المرور القديمة",
  path: ["oldPassword"],
})

export type AdminProfileActionState = { error?: string; success?: boolean }

export async function updateAdminProfileAction(
  _prev: AdminProfileActionState,
  formData: FormData
): Promise<AdminProfileActionState> {
  const raw = {
    name:        (formData.get("name")        as string) || undefined,
    phone:       (formData.get("phone")       as string) || undefined,
    oldPassword: (formData.get("oldPassword") as string) || undefined,
    newPassword: (formData.get("newPassword") as string) || undefined,
  }

  const parsed = updateSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  try {
    const updated = await serverFetch<ApiUser>("/api/admin/profile", {
      method: "PATCH",
      body:   parsed.data,
    })
    const session = await getSession()
    session.name = updated.name
    await session.save()
    revalidatePath("/admin/profile")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}
