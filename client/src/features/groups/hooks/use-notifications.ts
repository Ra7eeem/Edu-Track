"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiNotification, PaginatedResponse } from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useNotifications(opts?: { initialData?: PaginatedResponse<ApiNotification> }) {
  return useQuery({
    queryKey:        ["notifications"],
    queryFn:         () => clientFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=50"),
    staleTime:       20 * 1000,
    refetchInterval: 30_000,
    initialData:     opts?.initialData,
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => clientFetch<void>("/api/notifications/read-all", { method: "POST" } as never),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  })
}
