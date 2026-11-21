import { RankingClient } from "@/features/teacher/components/ranking-client"
import { TopBar } from "@/shared/components/layout/topbar"
import {
  getTeacherGroupByIdApi,
  getTeacherNotificationsApi,
} from "@/features/teacher/apis/teacher.api"
import { getGroupRankingApi } from "@/features/student/apis/student.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiRankingEntry } from "@/shared/types/api"

export default async function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()
  const now     = new Date()

  const [groupRes, rankingRes, notifsRes] = await Promise.allSettled([
    getTeacherGroupByIdApi(id),
    getGroupRankingApi(id, now.getMonth() + 1, now.getFullYear()),
    getTeacherNotificationsApi(1),
  ])

  const rawGroup = groupRes.status === "fulfilled" ? groupRes.value : null
  const group = rawGroup ? ("group" in rawGroup ? rawGroup.group : rawGroup) as ApiGroup : null
  const rawRanking = rankingRes.status === "fulfilled" ? rankingRes.value : []
  const ranking: ApiRankingEntry[] = Array.isArray(rawRanking)
    ? rawRanking
    : (rawRanking as any)?.ranking ?? []

  const unread = notifsRes.status === "fulfilled"
    ? toPaginatedArray(notifsRes.value).filter((n) => !n.isRead).length
    : 0

  return (
    <div className="flex flex-col">
      <TopBar
        title="الترتيب"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />
      <RankingClient
        groupId={id}
        initialRanking={ranking}
        currentMonth={now.getMonth() + 1}
        currentYear={now.getFullYear()}
      />
    </div>
  )
}
