"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Grade } from "@/shared/types/api"

const addStudentSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  phone:    z.string().min(7),
  grade:    z.nativeEnum(Grade),
  groupId:  z.string().min(1),
})

export type StudentActionState = {
  error?:       string
  success?:     boolean
  message?:     string
  fieldErrors?: Record<string, string[]>
}

export async function addStudentAction(
  _prev: StudentActionState,
  formData: FormData
): Promise<StudentActionState> {
  const raw = {
    name:     formData.get("name")     as string,
    email:    formData.get("email")    as string,
    password: formData.get("password") as string,
    phone:    formData.get("phone")    as string,
    grade:    formData.get("grade")    as string,
    groupId:  formData.get("groupId")  as string,
  }

  const parsed = addStudentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  try {
    await serverFetch("/api/teacher/students", {
      method: "POST",
      body:   parsed.data,
    })
    revalidatePath(`/teacher/group/${parsed.data.groupId}`)
    revalidatePath(`/teacher/group/${parsed.data.groupId}/students`)
    return { success: true, message: "تم إنشاء حساب الطالب بنجاح" }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء إضافة الطالب" }
  }
}

export async function removeStudentAction(
  groupId: string,
  studentId: string
): Promise<StudentActionState> {
  try {
    await serverFetch(`/api/teacher/groups/${groupId}/students/${studentId}`, {
      method: "DELETE",
    })
    revalidatePath(`/teacher/group/${groupId}`)
    revalidatePath(`/teacher/group/${groupId}/students`)
    return { success: true }
  } catch (e: unknown) {
    const err = e as { message?: string }
    return { error: err?.message ?? "حدث خطأ أثناء حذف الطالب" }
  }
}
