"use client"

import { clientFetch } from "@/shared/lib/api-client"
import {
  AdminDashboardStats,
  ApiGroup,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// ─── Helper: normalise API list response ─────────────────────────────────────
// The backend may return:
//   { data: [...], pagination: {} }   ← PaginatedResponse
//   [...]                             ← plain array
// We always want an array.
function toArray<T>(raw: PaginatedResponse<T> | T[] | unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === "object" && "data" in (raw as object) && Array.isArray((raw as PaginatedResponse<T>).data)) {
    return (raw as PaginatedResponse<T>).data
  }
  return []
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn:  () => clientFetch<AdminDashboardStats>("/api/admin/dashboard"),
  })
}

export function useAdminTeachers(search = "", page = 1) {
  return useQuery({
    queryKey: ["admin", "teachers", search, page],
    queryFn:  async () => {
      const raw = await clientFetch<PaginatedResponse<ApiUser> | ApiUser[]>(
        `/api/admin/teachers?search=${encodeURIComponent(search)}&page=${page}&limit=20`
      )
      return toArray<ApiUser>(raw)
    },
  })
}

export function useAdminGroups(search = "", page = 1) {
  return useQuery({
    queryKey: ["admin", "groups", search, page],
    queryFn:  async () => {
      const raw = await clientFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>(
        `/api/admin/groups?search=${encodeURIComponent(search)}&page=${page}&limit=20`
      )
      return toArray<ApiGroup>(raw)
    },
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      clientFetch<ApiUser>("/api/admin/teachers", {
        method: "POST",
        data:   body,
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "teachers"] }),
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      clientFetch<void>(`/api/admin/teachers/${id}`, {
        method: "DELETE",
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "teachers"] }),
  })
}

export function useToggleTeacherStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      clientFetch<ApiUser>(`/api/admin/teachers/${id}`, {
        method: "PATCH",
        data:   { isActive },
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "teachers"] }),
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string; grades?: string[]; teacherIds?: string[] }) =>
      clientFetch<ApiGroup>("/api/admin/groups", {
        method: "POST",
        data:   body,
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "groups"] }),
  })
}

export function useUpdateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; description?: string; isActive?: boolean }) =>
      clientFetch<ApiGroup>(`/api/admin/groups/${id}`, {
        method: "PATCH",
        data:   body,
      } as never),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "groups"] })
      qc.invalidateQueries({ queryKey: ["admin", "group", vars.id] })
    },
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      clientFetch<void>(`/api/admin/groups/${id}`, {
        method: "DELETE",
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "groups"] }),
  })
}

export function useAddTeacherToGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, teacherId }: { groupId: string; teacherId: string }) =>
      clientFetch<void>(`/api/admin/groups/${groupId}/teachers`, {
        method: "POST",
        data:   { teacherId },
      } as never),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "group", vars.groupId] })
      qc.invalidateQueries({ queryKey: ["admin", "group", vars.groupId, "teachers"] })
    },
  })
}

export function useRemoveTeacherFromGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, teacherId }: { groupId: string; teacherId: string }) =>
      clientFetch<void>(`/api/admin/groups/${groupId}/teachers/${teacherId}`, {
        method: "DELETE",
      } as never),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["admin", "group", vars.groupId] })
      qc.invalidateQueries({ queryKey: ["admin", "group", vars.groupId, "teachers"] })
    },
  })
}
