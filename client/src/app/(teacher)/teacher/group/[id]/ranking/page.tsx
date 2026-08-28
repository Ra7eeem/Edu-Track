import { RankingClient } from "@/features/teacher/components/ranking-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { resolveOne, serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, ApiRankingEntry, PaginatedResponse } from "@/shared/types/api"

interface RankingData {
  month: number; year: number; groupId: string
  ranking: ApiRankingEntry[]
}

export default async function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()
  const now     = new Date()

  const [groupRes, rankingRes, notifsRes] = await Promise.allSettled([
    serverFetch<ApiGroup>(`/api/groups/${id}`),
    serverFetch<RankingData>(`/api/groups/${id}/ranking?month=${now.getMonth() + 1}&year=${now.getFullYear()}`),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const group   = resolveOne(groupRes   as PromiseSettledResult<ApiGroup       | null>, null)
  const rankRes = resolveOne(rankingRes as PromiseSettledResult<RankingData    | null>, null)
  const ranking = rankRes?.ranking ?? []

  const notifsVal = notifsRes.status === "fulfilled" ? notifsRes.value : null
  const notifArr  = Array.isArray(notifsVal) ? notifsVal : (notifsVal?.data ?? [])
  const unread    = notifArr.filter((n: ApiNotification) => !n.isRead).length

  return (
    <div className="flex flex-col">
      <TopBar
        title="الترتيب"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
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
