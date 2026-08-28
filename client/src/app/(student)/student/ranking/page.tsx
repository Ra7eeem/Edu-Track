import { RankingClient } from "@/features/teacher/components/ranking-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, ApiRankingEntry, PaginatedResponse } from "@/shared/types/api"

interface RankingData {
  month: number; year: number; groupId: string
  ranking: ApiRankingEntry[]
}

export default async function StudentRankingPage() {
  const session = await getSessionData()
  const now     = new Date()

  const [groupsRes, notifsRes] = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiGroup>>("/api/students/me/groups"),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const groups  = groupsRes.status  === "fulfilled" ? groupsRes.value.data  : []
  const unread  = notifsRes.status  === "fulfilled"
    ? notifsRes.value.data.filter(n => !n.isRead).length : 0
  const firstGroup = groups[0]

  let ranking: ApiRankingEntry[] = []
  if (firstGroup) {
    try {
      const res = await serverFetch<RankingData>(
        `/api/groups/${firstGroup.id}/ranking?month=${now.getMonth()+1}&year=${now.getFullYear()}`
      )
      ranking = res.ranking
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
        groupId={firstGroup?.id ?? ""}
        initialRanking={ranking}
        currentMonth={now.getMonth() + 1}
        currentYear={now.getFullYear()}
      />
    </div>
  )
}
