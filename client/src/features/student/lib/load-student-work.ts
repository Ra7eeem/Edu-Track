import { resolveList } from "@/shared/lib/api-server"
import {
  ApiAssignment,
  AssignmentType,
  resolveId,
} from "@/shared/types/api"
import {
  getGroupAssignmentsApi,
  getStudentGroupsApi,
} from "../apis/student.api"

export async function loadStudentWork(groupParam: string | undefined, type: AssignmentType) {
  const groupsRes = await Promise.allSettled([getStudentGroupsApi(20)])
  const groups = resolveList(groupsRes[0])
  const firstId = resolveId(groups[0])
  const requested =
    groupParam && groups.some((group) => resolveId(group) === groupParam)
      ? groupParam
      : firstId

  if (!requested) {
    return { groups, activeGroupId: "", assignments: [] as ApiAssignment[] }
  }

  try {
    const raw = await getGroupAssignmentsApi(requested, 50)
    const assignments = (Array.isArray(raw) ? raw : []).filter((item) => item.type === type)
    return { groups, activeGroupId: requested, assignments }
  } catch {
    return { groups, activeGroupId: requested, assignments: [] as ApiAssignment[] }
  }
}
