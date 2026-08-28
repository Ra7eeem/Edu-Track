"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiGroup, PaginatedResponse } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

export function useTeacherGroups() {
  return useQuery({
    queryKey: ["teacher", "groups"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiGroup>>("/api/teacher/groups?limit=50"),
  })
}

export function useGroupDetails(groupId: string) {
  return useQuery({
    queryKey: ["groups", groupId],
    queryFn:  () => clientFetch<{ group: ApiGroup; teachers: unknown[]; studentsCount: number }>(
      `/api/groups/${groupId}`
    ),
    enabled:  !!groupId,
  })
}
