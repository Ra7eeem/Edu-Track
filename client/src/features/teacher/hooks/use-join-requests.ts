"use client"

import { approveJoinRequestAction, rejectJoinRequestAction } from "@/features/teacher/actions/join-request.action"
import { toArray } from "@/shared/lib/api-helpers"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiJoinRequest, JoinRequestStatus, PaginatedResponse } from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

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
    queryKey:        ["teacher", "join-requests", "count", JoinRequestStatus.PENDING],
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
    mutationFn: async (requestId: string) => {
      const result = await approveJoinRequestAction(requestId)
      if ("error" in result) throw new Error(result.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "join-requests"] })
      qc.invalidateQueries({ queryKey: ["teacher", "groups"] })
    },
  })
}

export function useRejectJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      const result = await rejectJoinRequestAction(requestId)
      if ("error" in result) throw new Error(result.error)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "join-requests"] })
    },
  })
}
