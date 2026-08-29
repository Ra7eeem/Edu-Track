"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiNotification, PaginatedResponse } from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=50"),
    staleTime:       20 * 1000, // slightly fresher than poll interval
    refetchInterval: 30_000,   // poll every 30s
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => clientFetch<void>("/api/notifications/read-all", { method: "POST" } as never),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}
