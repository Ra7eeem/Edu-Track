import { getTeacherAssignmentByIdApi } from "@/features/teacher/apis/teacher.api"
import { getSessionData } from "@/shared/lib/session"
import { ApiAssignment } from "@/shared/types/api"
import EditAssignmentClient from "./edit-client"
import { notFound } from "next/navigation"

interface EditAssignmentPageProps {
  params: Promise<{ id: string; assignmentId: string }>
}

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const { id: groupId, assignmentId } = await params
  const session = await getSessionData()

  let assignment: ApiAssignment | null = null
  try {
    assignment = await getTeacherAssignmentByIdApi(assignmentId)
  } catch {
    notFound()
  }

  if (!assignment) notFound()

  return (
    <EditAssignmentClient
      groupId={groupId}
      assignmentId={assignmentId}
      initialAssignment={assignment}
      userName={session?.name ?? ""}
    />
  )
}
