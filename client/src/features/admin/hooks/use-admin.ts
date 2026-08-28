"use client"

import { clientFetch } from "@/shared/lib/api-client"
import {
  AdminDashboardStats,
  ApiGroup,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn:  () => clientFetch<AdminDashboardStats>("/api/admin/dashboard"),
  })
}

export function useAdminTeachers(search = "", page = 1) {
  return useQuery({
    queryKey: ["admin", "teachers", search, page],
    queryFn:  () =>
      clientFetch<PaginatedResponse<ApiUser>>(
        `/api/admin/teachers?search=${search}&page=${page}&limit=20`
      ),
  })
}

export function useAdminGroups(search = "", page = 1) {
  return useQuery({
    queryKey: ["admin", "groups", search, page],
    queryFn:  () =>
      clientFetch<PaginatedResponse<ApiGroup>>(
        `/api/admin/groups?search=${search}&page=${page}&limit=20`
      ),
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      clientFetch<ApiUser>("/api/admin/teachers", { method: "POST", data: body } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "teachers"] }),
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      clientFetch<void>(`/api/admin/teachers/${id}`, { method: "DELETE" } as never),
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
