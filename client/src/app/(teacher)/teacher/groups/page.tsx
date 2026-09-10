import { resolveList, serverFetch } from "@/shared/lib/api-server"
import { getSessionData }  from "@/shared/lib/session"
import { ApiGroup, ApiJoinRequest, JoinRequestStatus, PaginatedResponse } from "@/shared/types/api"
import { GroupsClient }    from "./groups-client"

export default async function TeacherGroupsPage() {
  const session = await getSessionData()

  const [groupsRes, pendingRes] = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>("/api/teacher/groups?limit=50"),
    serverFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
      `/api/teacher/join-requests?status=${JoinRequestStatus.PENDING}&limit=50`
    ),
  ])

  const groups = resolveList(
    groupsRes as PromiseSettledResult<PaginatedResponse<ApiGroup> | ApiGroup[] | null>
  )

  const pendingRequests = resolveList(
    pendingRes as PromiseSettledResult<
      PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[] | null
    >
  )

  return (
    <GroupsClient
      initialGroups={groups}
      initialPending={pendingRequests.length}
      userName={session?.name ?? ""}
    />
  )
}