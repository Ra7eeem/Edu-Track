"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiGroupMembership, PaginatedResponse } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

export function useGroupStudents(groupId: string, search = "") {
  return useQuery({
    queryKey: ["teacher", "groups", groupId, "students", search],
    queryFn:  () =>
      clientFetch<PaginatedResponse<ApiGroupMembership>>(
        `/api/teacher/groups/${groupId}/students?limit=100${search ? `&search=${search}` : ""}`
      ),
    enabled: !!groupId,
  })
}
