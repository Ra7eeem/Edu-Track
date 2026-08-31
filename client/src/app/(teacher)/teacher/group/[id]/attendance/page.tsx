import { AttendanceClient } from "@/features/teacher/components/attendance-client"
import { PwaInstallButton } from "@/features/teacher/components/pwa-install-button"
import { TopBar }           from "@/shared/components/layout/topbar"
import { resolveList, resolveOne, serverFetch } from "@/shared/lib/api-server"
import { getSessionData }   from "@/shared/lib/session"
import { ApiGroup, ApiGroupMembership, ApiNotification, PaginatedResponse } from "@/shared/types/api"

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, studentsRes, notifsRes] = await Promise.allSettled([
    serverFetch<ApiGroup>(`/api/groups/${id}`),
    serverFetch<PaginatedResponse<ApiGroupMembership>>(
      `/api/teacher/groups/${id}/students?limit=200`
    ),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const group       = resolveOne(groupRes as PromiseSettledResult<ApiGroup | null>, null)
  const rawStudents = resolveList(
    studentsRes as PromiseSettledResult<
      PaginatedResponse<ApiGroupMembership> | ApiGroupMembership[] | null
    >
  )
  const unread = resolveList(
    notifsRes as PromiseSettledResult<
      PaginatedResponse<ApiNotification> | ApiNotification[] | null
    >
  ).filter(n => !n.isRead).length

  const students = rawStudents
    .map(s => {
      const user =
        (s as unknown as { student?: { _id?: string; id?: string; name?: string } })
          .student ?? (s as unknown as { _id?: string; id?: string; name?: string })
      const sid  = user._id ?? user.id ?? ""
      const name = user.name ?? ""
      return { id: sid, name, avatar: name ? name[0] : "؟" }
    })
    .filter(s => s.id)

  const groupName = group?.name ?? ""

  return (
    <div className="flex flex-col">
      <TopBar
        title="تسجيل الحضور"
        subtitle={groupName}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
        actions={
          <PwaInstallButton groupId={id} groupName={groupName} />
        }
      />
      <AttendanceClient groupId={id} students={students} />
    </div>
  )
}
