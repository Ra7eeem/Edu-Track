import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiAssignment, PaginatedResponse } from "@/shared/types/api"
import AssignmentsClient from "./assignments-client"

interface AssignmentsPageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentsPage({ params }: AssignmentsPageProps) {
  const { id: groupId } = await params
  const session = await getSessionData()

  const result = await serverFetch<PaginatedResponse<ApiAssignment> | ApiAssignment[]>(
    `/api/assignments/group/${groupId}?limit=50`
  )

  const initialAssignments = Array.isArray(result) ? result : result.data ?? []

  return (
    <AssignmentsClient
      groupId={groupId}
      initialAssignments={initialAssignments}
      userName={session?.name ?? ""}
    />
  )
}
