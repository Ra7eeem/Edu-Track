import { getTeacherAssignmentsApi } from "@/features/teacher/apis/teacher.api"
import { getSessionData } from "@/shared/lib/session"
import { ApiAssignment } from "@/shared/types/api"
import AssignmentsClient from "./assignments-client"

interface AssignmentsPageProps {
  params: Promise<{ id: string }>
}

export default async function AssignmentsPage({ params }: AssignmentsPageProps) {
  const { id: groupId } = await params
  const session = await getSessionData()

  let initialAssignments: ApiAssignment[] = []
  try {
    const result = await getTeacherAssignmentsApi(groupId, 50)
    initialAssignments = Array.isArray(result) ? result : result.data ?? []
  } catch {
    initialAssignments = []
  }

  return (
    <AssignmentsClient
      groupId={groupId}
      initialAssignments={initialAssignments}
      userName={session?.name ?? ""}
    />
  )
}
