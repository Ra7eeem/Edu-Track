import { getTeacherGroupsApi, getTeacherJoinRequestsApi } from "@/features/teacher/apis/teacher.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { JoinRequestStatus } from "@/shared/types/api"
import { GroupsClient } from "./groups-client"

export default async function TeacherGroupsPage() {
  const session = await getSessionData()

  const [groupsRes, pendingRes] = await Promise.allSettled([
    getTeacherGroupsApi(50),
    getTeacherJoinRequestsApi(50),
  ])

  const groups = groupsRes.status === "fulfilled" ? toPaginatedArray(groupsRes.value) : []
  const allRequests = pendingRes.status === "fulfilled" ? toPaginatedArray(pendingRes.value) : []
  const pendingRequests = allRequests.filter((r) => r.status === JoinRequestStatus.PENDING)

  return (
    <GroupsClient
      initialGroups={groups}
      initialPending={pendingRequests.length}
      userName={session?.name ?? ""}
    />
  )
}