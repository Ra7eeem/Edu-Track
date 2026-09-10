import { getSessionData } from "@/shared/lib/session"
import { serverFetch } from "@/shared/lib/api-server"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { ApiGroup, PaginatedResponse } from "@/shared/types/api"
import type { GroupDetails } from "@/features/teacher/hooks/use-teacher-groups"
import type { GroupStudent } from "@/features/teacher/hooks/use-group-students"
import { GroupManageClient } from "./group-manage-client"

export default async function GroupManagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, groupResponse, studentsResponse] = await Promise.all([
    getSessionData(),
    serverFetch<ApiGroup | GroupDetails>(`/api/groups/${id}`).catch(() => null),
    serverFetch<PaginatedResponse<GroupStudent> | GroupStudent[]>(
      `/api/teacher/groups/${id}/students?limit=100`
    ).catch(() => null),
  ])

  const initialGroup = groupResponse
    ? "group" in groupResponse
      ? groupResponse
      : { group: groupResponse, teachers: [], studentsCount: 0 }
    : undefined
  const initialStudents = toPaginatedArray<GroupStudent>(studentsResponse)

  return (
    <GroupManageClient
      groupId={id}
      initialGroup={initialGroup}
      initialStudents={initialStudents}
      userName={session?.name ?? ""}
    />
  )
}
