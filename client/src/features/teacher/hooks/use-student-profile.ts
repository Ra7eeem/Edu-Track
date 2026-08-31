"use client"

import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiStudentNote,
  AttendanceRegister,
  AttendanceStatus,
  ApiUser,
} from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface StudentProfileData {
  student:           ApiUser
  scores:            { month: number; year: number; score: number; presentCount: number; lateCount: number; absentCount: number; bonusPoints: number }[]
  notes:             ApiStudentNote[]
  attendanceRecords: { date: string; status: AttendanceStatus }[]
}

export function useStudentProfileForTeacher(groupId: string, studentId: string) {
  return useQuery({
    queryKey: ["teacher", "groups", groupId, "student", studentId, "profile"],
    queryFn:  () =>
      clientFetch<StudentProfileData>(
        `/api/teacher/groups/${groupId}/students/${studentId}/profile`
      ),
    enabled:   !!groupId && !!studentId,
    staleTime: 60 * 1000,
  })
}

export function useStudentNotes(groupId: string, studentId: string) {
  return useQuery({
    queryKey: ["teacher", "groups", groupId, "student", studentId, "notes"],
    queryFn:  () =>
      clientFetch<ApiStudentNote[]>(
        `/api/teacher/groups/${groupId}/students/${studentId}/notes`
      ),
    enabled:   !!groupId && !!studentId,
    staleTime: 30 * 1000,
  })
}

export function useCreateNote(groupId: string, studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      clientFetch<ApiStudentNote>(
        `/api/teacher/groups/${groupId}/students/${studentId}/notes`,
        { method: "POST", data: { content } } as never
      ),
    onMutate: async (content: string) => {
      // Optimistic: add a temporary note immediately
      const queryKey = ["teacher", "groups", groupId, "student", studentId, "notes"]
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData(queryKey)
      const tempNote: ApiStudentNote = {
        _id:       `temp-${Date.now()}`,
        teacher:   "",
        student:   studentId,
        group:     groupId,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      qc.setQueryData(queryKey, (old: unknown) => {
        const arr = Array.isArray(old) ? (old as ApiStudentNote[]) : []
        return [tempNote, ...arr]
      })
      return { prev, queryKey }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) qc.setQueryData(ctx.queryKey, ctx.prev)
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["teacher", "groups", groupId, "student", studentId, "notes"],
        refetchType: "active",
      })
      qc.invalidateQueries({
        queryKey: ["teacher", "groups", groupId, "student", studentId, "profile"],
        refetchType: "active",
      })
    },
  })
}

export function useUpdateNote(groupId: string, studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ noteId, content }: { noteId: string; content: string }) =>
      clientFetch<ApiStudentNote>(
        `/api/teacher/groups/${groupId}/students/${studentId}/notes/${noteId}`,
        { method: "PATCH", data: { content } } as never
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["teacher", "groups", groupId, "student", studentId, "notes"],
        refetchType: "active",
      })
      qc.invalidateQueries({
        queryKey: ["teacher", "groups", groupId, "student", studentId, "profile"],
        refetchType: "active",
      })
    },
  })
}

export function useDeleteNote(groupId: string, studentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) =>
      clientFetch<void>(
        `/api/teacher/groups/${groupId}/students/${studentId}/notes/${noteId}`,
        { method: "DELETE" } as never
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["teacher", "groups", groupId, "student", studentId, "notes"],
        refetchType: "active",
      })
      qc.invalidateQueries({
        queryKey: ["teacher", "groups", groupId, "student", studentId, "profile"],
        refetchType: "active",
      })
    },
  })
}

export function useAttendanceRegister(
  groupId: string,
  month:   number,
  year:    number,
  role:    "teacher" | "admin" = "teacher"
) {
  return useQuery({
    queryKey: [role, "groups", groupId, "attendance-register", month, year],
    queryFn:  () => {
      const base = role === "admin"
        ? `/api/admin/groups/${groupId}/attendance/register`
        : `/api/teacher/groups/${groupId}/attendance/register`
      return clientFetch<AttendanceRegister>(`${base}?month=${month}&year=${year}`)
    },
    enabled:   !!groupId,
    staleTime: 2 * 60 * 1000,
  })
}
