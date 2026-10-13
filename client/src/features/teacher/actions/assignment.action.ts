"use server"

import { serverFetch } from "@/shared/lib/api-server"
import { ApiAssignment, AssignmentType } from "@/shared/types/api"
import { revalidatePath, updateTag } from "next/cache"
import { z } from "zod"

const idSchema = z.object({
  assignmentId: z.string().min(1),
  groupId:      z.string().min(1),
})

const choiceSchema = z.object({
  id:   z.string().min(1).max(10),
  text: z.string().min(1, "نص الخيار مطلوب").max(500).trim(),
})

const questionSchema = z.object({
  _id:           z.string().optional(),
  text:          z.string().min(1, "نص السؤال مطلوب").max(2000).trim(),
  choices:       z.array(choiceSchema).min(2, "كل سؤال يحتاج خيارين على الأقل").max(6),
  correctAnswer: z.string().min(1, "الإجابة الصحيحة مطلوبة"),
  points:        z.number().int().min(1).max(100).default(1),
})

const createSchema = z.object({
  groupId:         z.string().min(1, "معرّف المجموعة مطلوب"),
  type:            z.nativeEnum(AssignmentType).default(AssignmentType.HOMEWORK),
  title:           z.string().min(1, "العنوان مطلوب").max(300).trim(),
  description:     z.string().max(3000).trim().optional(),
  youtubeUrl:      z.string().url("رابط يوتيوب غير صالح").optional().or(z.literal("")),
  dueDate:         z.string().optional(),
  durationMinutes: z.number().int().min(1).max(600).optional().nullable(),
  availableFrom:   z.string().optional().nullable(),
  availableTo:     z.string().optional().nullable(),
  questions:       z.array(questionSchema).optional().default([]),
})

const updateSchema = z.object({
  groupId:         z.string().min(1, "معرّف المجموعة مطلوب"),
  type:            z.nativeEnum(AssignmentType).optional(),
  title:           z.string().min(1, "العنوان مطلوب").max(300).trim().optional(),
  description:     z.string().max(3000).trim().optional(),
  youtubeUrl:      z.string().url("رابط يوتيوب غير صالح").optional().or(z.literal("")),
  dueDate:         z.string().optional().nullable(),
  durationMinutes: z.number().int().min(1).max(600).optional().nullable(),
  availableFrom:   z.string().optional().nullable(),
  availableTo:     z.string().optional().nullable(),
  questions:       z.array(questionSchema).optional(),
})

export type AssignmentToggleState =
  | { success: true; data: ApiAssignment }
  | { error: string }

export type AssignmentCreateState =
  | { success: true; data: ApiAssignment }
  | { error: string }

export type AssignmentUpdateState =
  | { success: true; data: ApiAssignment }
  | { error: string }

export type AssignmentDeleteState =
  | { success: true }
  | { error: string }

function revalidateAssignmentViews(groupId: string) {
  updateTag(`student-assignments-${groupId}`)
  revalidatePath("/student/assignments", "layout")
  revalidatePath("/student/exams", "layout")
  revalidatePath(`/teacher/group/${groupId}/assignments`)
}

export async function toggleAssignmentResultsAction(
  assignmentId: string,
  groupId:      string
): Promise<AssignmentToggleState> {
  const parsed = idSchema.safeParse({ assignmentId, groupId })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  try {
    const data = await serverFetch<ApiAssignment>(
      `/api/assignments/${assignmentId}/toggle-results`,
      { method: "PATCH" }
    )
    revalidateAssignmentViews(groupId)
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}

export async function toggleAssignmentVisibilityAction(
  assignmentId: string,
  groupId:      string
): Promise<AssignmentToggleState> {
  const parsed = idSchema.safeParse({ assignmentId, groupId })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  try {
    const data = await serverFetch<ApiAssignment>(
      `/api/assignments/${assignmentId}/toggle-visibility`,
      { method: "PATCH" }
    )
    revalidateAssignmentViews(groupId)
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}

export async function createAssignmentAction(
  input: Record<string, unknown>
): Promise<AssignmentCreateState> {
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]?.message ?? "بيانات غير صالحة"
    return { error: first }
  }

  const body = {
    ...parsed.data,
    youtubeUrl: parsed.data.youtubeUrl || undefined,
    dueDate:    parsed.data.dueDate    || undefined,
    availableFrom: parsed.data.availableFrom || undefined,
    availableTo:   parsed.data.availableTo   || undefined,
  }

  try {
    const data = await serverFetch<ApiAssignment>("/api/assignments", {
      method: "POST",
      body,
    })
    revalidateAssignmentViews(parsed.data.groupId)
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}

export async function updateAssignmentAction(
  assignmentId: string,
  input: Record<string, unknown>
): Promise<AssignmentUpdateState> {
  const parsed = updateSchema.safeParse(input)
  if (!parsed.success) {
    const first = parsed.error.errors[0]?.message ?? "بيانات غير صالحة"
    return { error: first }
  }

  const { groupId, ...rest } = parsed.data
  const body = {
    ...rest,
    youtubeUrl:    rest.youtubeUrl    || undefined,
    dueDate:       rest.dueDate       || undefined,
    availableFrom: rest.availableFrom || undefined,
    availableTo:   rest.availableTo   || undefined,
  }

  try {
    const data = await serverFetch<ApiAssignment>(`/api/assignments/${assignmentId}`, {
      method: "PATCH",
      body,
    })
    revalidateAssignmentViews(groupId)
    revalidatePath(`/teacher/group/${groupId}/assignments/${assignmentId}/edit`)
    revalidatePath(`/student/exams/${assignmentId}`, "layout")
    revalidatePath(`/student/exams/${assignmentId}/results`, "layout")
    return { success: true, data }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}

export async function deleteAssignmentAction(
  assignmentId: string,
  groupId:      string
): Promise<AssignmentDeleteState> {
  const parsed = idSchema.safeParse({ assignmentId, groupId })
  if (!parsed.success) return { error: "بيانات غير صالحة" }

  try {
    await serverFetch<void>(`/api/assignments/${assignmentId}`, {
      method: "DELETE",
    })
    revalidateAssignmentViews(groupId)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as { message?: string }).message ?? "حدث خطأ" }
  }
}
