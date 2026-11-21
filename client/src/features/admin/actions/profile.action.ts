"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiResponse, ApiUser } from "@/shared/types/api"
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

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/admin/profile`, {
      method: "PATCH",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify(parsed.data),
    })
    const json: ApiResponse<ApiUser> = await res.json()
    if (!res.ok || !json.success) return { error: json.message || "حدث خطأ" }

    revalidatePath("/admin/profile")
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string })?.message ?? "حدث خطأ" }
  }
}
