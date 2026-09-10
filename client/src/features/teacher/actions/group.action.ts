"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiGroup, Grade } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Mirrors the server's group creation rules (group.schemas.ts) so editing a group
// applies the exact same validation as creating one.
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

  try {
    // The PATCH endpoint itself re-verifies the caller is the group's teacher
    // (GroupTeacher link) and re-validates every field server-side — the action
    // also performs input validation above for an early, user-friendly error.
    const group = await serverFetch<ApiGroup>(`/api/groups/${groupId}`, {
      method: "PATCH",
      body:   {
        name:        parsed.data.name.trim(),
        description: (parsed.data.description ?? "").trim(),
        grades:      parsed.data.grades ? [...new Set(parsed.data.grades)] : [],
      },
    })

    revalidatePath("/teacher/groups")
    revalidatePath(`/teacher/group/${groupId}`)
    return { success: true, data: group }
  } catch (e: unknown) {
    return {
      success: false,
      error:   (e as { message?: string })?.message ?? "حدث خطأ أثناء تعديل المجموعة",
    }
  }
}