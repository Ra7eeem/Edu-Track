"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiComment, PaginatedResponse } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

export function usePostComments(groupId: string, postId: string, enabled = false) {
  return useQuery({
    queryKey: ["groups", groupId, "posts", postId, "comments"],
    queryFn:  () =>
      clientFetch<PaginatedResponse<ApiComment>>(
        `/api/groups/${groupId}/posts/${postId}/comments?limit=50`
      ),
    enabled: enabled && !!groupId && !!postId,
    staleTime: 30_000,
  })
}
