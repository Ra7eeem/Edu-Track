import { resolveList, serverFetch } from "@/shared/lib/api-server"
import {
  ApiAssignment,
  ApiGroup,
  AssignmentType,
  PaginatedResponse,
  resolveId,
} from "@/shared/types/api"

export async function loadStudentWork(groupParam: string | undefined, type: AssignmentType) {
  const groupsRes = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>("/api/students/me/groups?limit=20"),
  ])
  const groups = resolveList(groupsRes[0] as PromiseSettledResult<PaginatedResponse<ApiGroup> | ApiGroup[] | null>)
  const firstId = resolveId(groups[0])
  const requested = groupParam && groups.some((group) => resolveId(group) === groupParam)
    ? groupParam
    : firstId

  if (!requested) {
    return { groups, activeGroupId: "", assignments: [] as ApiAssignment[] }
  }

  try {
    const raw = await serverFetch<ApiAssignment[]>(`/api/assignments/group/${requested}?limit=50`, {
      tags: [`student-assignments-${requested}`],
    })
    const assignments = (Array.isArray(raw) ? raw : []).filter((item) => item.type === type)
    return { groups, activeGroupId: requested, assignments }
  } catch {
    return { groups, activeGroupId: requested, assignments: [] as ApiAssignment[] }
  }
}
