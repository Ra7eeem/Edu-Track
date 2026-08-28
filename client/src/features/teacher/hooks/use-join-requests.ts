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

export function useJoinRequests(status?: JoinRequestStatus) {
  const qs = status ? `?status=${status}&limit=50` : "?limit=50"
  return useQuery({
    queryKey: ["teacher", "join-requests", status],
    queryFn: async () => {
      const raw = await clientFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
        `/api/teacher/join-requests${qs}`
      )
      return toArray<ApiJoinRequest>(raw)
    },
  })
}

export function useJoinRequestCounts() {
  return useQuery({
    queryKey: ["teacher", "join-requests", "pending"],
    queryFn: async () => {
      const raw = await clientFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
        "/api/teacher/join-requests?status=PENDING&limit=50"
      )
      return toArray<ApiJoinRequest>(raw).length
    },
    refetchInterval: 30_000,
  })
}

export function useApproveJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      clientFetch<void>(`/api/teacher/join-requests/${requestId}/approve`, {
        method: "POST",
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "join-requests"] }),
  })
}

export function useRejectJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) =>
      clientFetch<void>(`/api/teacher/join-requests/${requestId}/reject`, {
        method: "POST",
      } as never),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "join-requests"] }),
  })
}
