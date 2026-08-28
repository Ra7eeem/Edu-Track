import { StudentsClient } from "@/features/teacher/components/students-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { resolveList, resolveOne, serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiGroupMembership, ApiNotification, PaginatedResponse } from "@/shared/types/api"

export default async function StudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, studentsRes, notifsRes] = await Promise.allSettled([
    serverFetch<ApiGroup>(`/api/groups/${id}`),
    serverFetch<PaginatedResponse<ApiGroupMembership>>(`/api/teacher/groups/${id}/students?limit=200`),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const group    = resolveOne(groupRes    as PromiseSettledResult<ApiGroup | null>, null)
  const students = resolveList(studentsRes as PromiseSettledResult<PaginatedResponse<ApiGroupMembership> | ApiGroupMembership[] | null>)
  const unread   = resolveList(notifsRes   as PromiseSettledResult<PaginatedResponse<ApiNotification>    | ApiNotification[]    | null>)
    .filter((n) => !n.isRead).length

    

  return (
    <div className="flex flex-col">
      <TopBar
        title="الطلاب"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />
      <StudentsClient groupId={id} initialStudents={students} />
    </div>
  )
}
