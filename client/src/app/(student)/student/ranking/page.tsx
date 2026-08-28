import { RankingClient } from "@/features/teacher/components/ranking-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { resolveList, serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, ApiRankingEntry, PaginatedResponse } from "@/shared/types/api"

export default async function StudentRankingPage() {
  const session = await getSessionData()
  const now     = new Date()

  const [groupsRes, notifsRes] = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>("/api/students/me/groups"),
    serverFetch<PaginatedResponse<ApiNotification> | ApiNotification[]>("/api/notifications?limit=1"),
  ])

  const groups  = resolveList(groupsRes as PromiseSettledResult<PaginatedResponse<ApiGroup> | ApiGroup[] | null>)
  const notifs  = resolveList(notifsRes as PromiseSettledResult<PaginatedResponse<ApiNotification> | ApiNotification[] | null>)
  const unread  = notifs.filter(n => !n.isRead).length
  const firstGroup = groups[0] ?? null

  let ranking: ApiRankingEntry[] = []
  if (firstGroup) {
    const gid = (firstGroup._id ?? firstGroup.id) as string
    try {
      const res = await serverFetch<{ ranking: ApiRankingEntry[] }>(
        `/api/groups/${gid}/ranking?month=${now.getMonth()+1}&year=${now.getFullYear()}`
      )
      ranking = res.ranking ?? []
    } catch {}
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="الترتيب"
        subtitle={firstGroup?.name}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "أ")[0]}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />
      <RankingClient
        groupId={(firstGroup?._id ?? firstGroup?.id ?? "") as string}
        initialRanking={ranking}
        currentMonth={now.getMonth() + 1}
        currentYear={now.getFullYear()}
      />
    </div>
  )
}
