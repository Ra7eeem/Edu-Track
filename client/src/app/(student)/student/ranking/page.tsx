import { RankingClient } from "@/features/teacher/components/ranking-client"
import { TopBar } from "@/shared/components/layout/topbar"
import {
  getGroupRankingApi,
  getStudentGroupsApi,
} from "@/features/student/apis/student.api"
import { resolveList, serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, ApiRankingEntry, PaginatedResponse, resolveId } from "@/shared/types/api"

export default async function StudentRankingPage() {
  const session = await getSessionData()
  const now = new Date()

  const [groupsRes, notifsRes] = await Promise.allSettled([
    getStudentGroupsApi(),
    serverFetch<PaginatedResponse<ApiNotification> | ApiNotification[]>("/api/notifications?limit=1"),
  ])

  const groups = resolveList(groupsRes as PromiseSettledResult<PaginatedResponse<ApiGroup> | ApiGroup[] | null>)
  const notifs = resolveList(notifsRes as PromiseSettledResult<PaginatedResponse<ApiNotification> | ApiNotification[] | null>)
  const unread = notifs.filter((n) => !n.isRead).length
  const firstGroup = groups[0] ?? null
  const gid = firstGroup ? resolveId(firstGroup) : ""

  let ranking: ApiRankingEntry[] = []
  if (gid) {
    try {
      const res = await getGroupRankingApi(gid, now.getMonth() + 1, now.getFullYear())
      ranking = Array.isArray(res) ? res : ((res as unknown as { ranking?: ApiRankingEntry[] })?.ranking ?? [])
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
        groupId={gid}
        initialRanking={ranking}
        currentMonth={now.getMonth() + 1}
        currentYear={now.getFullYear()}
      />
    </div>
  )
}
