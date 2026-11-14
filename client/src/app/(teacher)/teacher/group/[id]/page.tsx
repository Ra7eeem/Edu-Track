import { getSessionData } from "@/shared/lib/session"
import { getGroupStudentsApi, getTeacherGroupByIdApi } from "@/features/teacher/apis/teacher.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import type { GroupDetails, GroupStudent } from "@/features/teacher/types/teacher"
import { GroupManageClient } from "./group-manage-client"

export default async function GroupManagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [session, groupResponse, studentsResponse] = await Promise.all([
    getSessionData(),
    getTeacherGroupByIdApi(id).catch(() => null),
    getGroupStudentsApi(id).catch(() => null),
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
