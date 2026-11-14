"use server"

import { BASE_API_URL, HEADERS } from "@/shared/constant/api.constant"
import { getNextAuthToken } from "@/shared/lib/utils/auth.utils"
import { ApiResponse, AttendanceStatus } from "@/shared/types/api"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const saveAttendanceSchema = z.object({
  groupId: z.string().min(1),
  date:    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح"),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status:    z.nativeEnum(AttendanceStatus),
  })).min(1),
})

export type AttendanceActionState = {
  error?:   string
  success?: boolean
}

export async function saveAttendanceAction(
  groupId: string,
  date:    string,
  records: Array<{ studentId: string; status: AttendanceStatus }>
): Promise<AttendanceActionState> {
  const parsed = saveAttendanceSchema.safeParse({ groupId, date, records })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  const token = await getNextAuthToken()
  if (!token?.token) return { error: "غير مصرح" }

  try {
    const res = await fetch(`${BASE_API_URL}/api/groups/${groupId}/attendance`, {
      method: "POST",
      headers: {
        ...HEADERS.JsonBody,
        ...HEADERS.authorize(token.token),
      },
      body: JSON.stringify({ date, records }),
    })
    const json: ApiResponse<unknown> = await res.json()
    if (!res.ok || !json.success) return { error: json.message || "حدث خطأ أثناء حفظ الحضور" }

    revalidatePath(`/teacher/group/${groupId}`)
    revalidatePath(`/teacher/group/${groupId}/attendance`)
    revalidatePath(`/teacher/group/${groupId}/ranking`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء حفظ الحضور" }
  }
}
