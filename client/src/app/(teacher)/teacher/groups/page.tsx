import { resolveList, resolveOne, serverFetch } from "@/shared/lib/api-server"
import { getSessionData }  from "@/shared/lib/session"
import { ApiGroup, ApiJoinRequest, ApiNotification, JoinRequestStatus, PaginatedResponse } from "@/shared/types/api"
import { GroupsClient }    from "./groups-client"

export default async function TeacherGroupsPage() {
  const session = await getSessionData()

  const [groupsRes, pendingRes, notifsRes] = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>("/api/teacher/groups?limit=50"),
    serverFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
      `/api/teacher/join-requests?status=${JoinRequestStatus.PENDING}&limit=50`
    ),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const groups = resolveList(
    groupsRes as PromiseSettledResult<PaginatedResponse<ApiGroup> | ApiGroup[] | null>
  )

  const pendingRequests = resolveList(
    pendingRes as PromiseSettledResult<
      PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[] | null
    >
  )

  const unread = resolveList(
    notifsRes as PromiseSettledResult<
      PaginatedResponse<ApiNotification> | ApiNotification[] | null
    >
  ).filter(n => !n.isRead).length

  return (
    <GroupsClient
      initialGroups={groups}
      initialPending={pendingRequests.length}
      unreadCount={unread}
      userName={session?.name ?? ""}
    />
  )
}
