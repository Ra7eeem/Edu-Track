import { getTeacherJoinRequestsApi } from "@/features/teacher/apis/teacher.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { ApiJoinRequest, JoinRequestStatus } from "@/shared/types/api"
import { JoinRequestsClient } from "./join-requests-client"

export default async function JoinRequestsPage() {
  const session = await getSessionData()

  let pendingRequests: ApiJoinRequest[] = []
  try {
    const res = await getTeacherJoinRequestsApi(50)
    const all = toPaginatedArray(res)
    pendingRequests = all.filter((r) => r.status === JoinRequestStatus.PENDING)
  } catch {
    pendingRequests = []
  }

  return (
    <JoinRequestsClient
      initialRequests={pendingRequests}
      initialPending={pendingRequests.length}
      userName={session?.name ?? ""}
    />
  )
}
