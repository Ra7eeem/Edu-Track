import { resolveList, serverFetch } from "@/shared/lib/api-server"
import { getSessionData }           from "@/shared/lib/session"
import { ApiJoinRequest, JoinRequestStatus, PaginatedResponse } from "@/shared/types/api"
import { JoinRequestsClient }       from "./join-requests-client"

export default async function JoinRequestsPage() {
  const session = await getSessionData()

  // Fetch pending requests on the server — seeds the client cache instantly
  const res = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[]>(
      `/api/teacher/join-requests?status=${JoinRequestStatus.PENDING}&limit=50`
    ),
  ])

  const pendingRequests = resolveList(
    res[0] as PromiseSettledResult<
      PaginatedResponse<ApiJoinRequest> | ApiJoinRequest[] | null
    >
  )

  return (
    <JoinRequestsClient
      initialRequests={pendingRequests}
      initialPending={pendingRequests.length}
      userName={session?.name ?? ""}
    />
  )
}
