import { getSessionData } from "@/shared/lib/session"
import NewAssignmentClient from "./new-client"

interface NewAssignmentPageProps {
  params: Promise<{ id: string }>
}

export default async function NewAssignmentPage({ params }: NewAssignmentPageProps) {
  const { id: groupId } = await params
  const session = await getSessionData()

  return (
    <NewAssignmentClient
      groupId={groupId}
      userName={session?.name ?? ""}
    />
  )
}
