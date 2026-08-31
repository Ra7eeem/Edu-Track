"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiJoinRequest, JoinRequestStatus, PaginatedResponse } from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data))  return r.data  as T[]
    if (Array.isArray(r.docs))  return r.docs  as T[]
    if (Array.isArray(r.items)) return r.items as T[]
  }
  return []
}

export function useJoinRequests(status?: JoinRequestStatus, opts?: { initialData?: ApiJoinRequest[] }) {
  const qs = status ? `?status=${status}&limit=50` : "?limit=50"
  return useQuery({
    queryKey:    ["teacher", "join-requests", status],
    queryFn:     async () => {
      const raw = await clientFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
        `/api/teacher/join-requests${qs}`
      )
      return toArray<ApiJoinRequest>(raw)
    },
    staleTime:   30 * 1000,
    initialData: opts?.initialData,
    retry:       3,
  })
}

export function useJoinRequestCounts(opts?: { initialData?: number }) {
  return useQuery({
    queryKey:        ["teacher", "join-requests", JoinRequestStatus.PENDING],
    queryFn:         async () => {
      const raw = await clientFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
        "/api/teacher/join-requests?status=PENDING&limit=50"
      )
      return toArray<ApiJoinRequest>(raw).length
    },
    staleTime:       20 * 1000,
    refetchInterval: 30_000,
    initialData:     opts?.initialData,
    retry:           3,
  })
}

export function useApproveJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      clientFetch<void>(`/api/teacher/join-requests/${requestId}/approve`, {
        method: "POST",
      } as never),
    onSuccess: () => {
      // Invalidate join requests (all statuses)
      qc.invalidateQueries({ queryKey: ["teacher", "join-requests"] })
      // Also bust the students list — the approved student should now appear
      qc.invalidateQueries({ queryKey: ["teacher", "groups"] })
    },
  })
}

export function useRejectJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      clientFetch<void>(`/api/teacher/join-requests/${requestId}/reject`, {
        method: "POST",
      } as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "join-requests"] })
    },
  })
}
