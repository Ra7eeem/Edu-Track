"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { AttendanceStatus } from "@/shared/types/api"
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
  if (!parsed.success) {
    return { error: "بيانات غير صالحة" }
  }

  try {
    await serverFetch(`/api/groups/${groupId}/attendance`, {
      method: "POST",
      body:   { date, records },
    })
    revalidatePath(`/teacher/group/${groupId}`)
    revalidatePath(`/teacher/group/${groupId}/attendance`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء حفظ الحضور" }
  }
}
