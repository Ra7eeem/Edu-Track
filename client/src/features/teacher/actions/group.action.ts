"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiGroup, ApiResponse, Grade } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const updateGroupSchema = z.object({
  name:        z.string().min(2, "اسم المجموعة يجب ألا يقل عن حرفين").max(150).trim(),
  description: z.string().max(1000).optional(),
  grades:      z.array(z.nativeEnum(Grade)).optional(),
})

export type UpdateGroupInput = z.infer<typeof updateGroupSchema>

export type UpdateGroupResult =
  | { success: true; data: ApiGroup }
  | { success: false; error: string }

export async function updateGroupAction(
  groupId: string,
  input: UpdateGroupInput
): Promise<UpdateGroupResult> {
  const parsed = updateGroupSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const token = await getNextAuthToken()
  if (!token?.token) return { success: false, error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}`, {
      method: "PATCH",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({
        name:        parsed.data.name.trim(),
        description: (parsed.data.description ?? "").trim(),
        grades:      parsed.data.grades ? [...new Set(parsed.data.grades)] : [],
      }),
    })

    const json: ApiResponse<ApiGroup> = await res.json()
    if (!res.ok || !json.success) {
      return { success: false, error: json.message || "حدث خطأ أثناء تعديل المجموعة" }
    }

    revalidatePath("/teacher/groups")
    revalidatePath(`/teacher/group/${groupId}`)
    return { success: true, data: json.data }
  } catch (e: unknown) {
    return {
      success: false,
      error:   (e as { message?: string })?.message ?? "حدث خطأ أثناء تعديل المجموعة",
    }
  }
}
