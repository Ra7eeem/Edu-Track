import { TeamsClient } from "@/features/teacher/components/teams-client"
import { TopBar } from "@/shared/components/layout/topbar"
import {
  getTeacherGroupByIdApi,
  getTeacherNotificationsApi,
} from "@/features/teacher/apis/teacher.api"
import { getClassroomTeamsApi } from "@/features/teacher/apis/teams.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup } from "@/shared/types/api"

export default async function TeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSessionData()

  const [groupRes, teamsRes, notifsRes] = await Promise.allSettled([
    getTeacherGroupByIdApi(id),
    getClassroomTeamsApi(id),
    getTeacherNotificationsApi(1),
  ])

  const rawGroup = groupRes.status === "fulfilled" ? groupRes.value : null
  const group = rawGroup ? ("group" in rawGroup ? rawGroup.group : rawGroup) as ApiGroup : null
  const teamsData = teamsRes.status === "fulfilled" ? teamsRes.value : undefined
  const unread = notifsRes.status === "fulfilled"
    ? toPaginatedArray(notifsRes.value).filter((n) => !n.isRead).length
    : 0

  return (
    <div className="flex flex-col">
      <TopBar
        title="الفرق والتنافس"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />
      <TeamsClient groupId={id} initialData={teamsData} />
    </div>
  )
}
