"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiPost, PaginatedResponse } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

export function useGroupPosts(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId, "posts"],
    queryFn:  () =>
      clientFetch<PaginatedResponse<ApiPost>>(`/api/groups/${groupId}/posts?limit=20`),
    enabled:   !!groupId,
    staleTime: 60 * 1000,
  })
}
