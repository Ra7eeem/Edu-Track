import { RankingClient } from "@/features/teacher/components/ranking-client"
import { TopBar } from "@/shared/components/layout/topbar"
import {
  getGroupRankingApi,
  getNotificationsApi,
  getStudentGroupsApi,
} from "@/features/student/apis/student.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { ApiRankingEntry, resolveId } from "@/shared/types/api"

export default async function StudentRankingPage() {
  const session = await getSessionData()
  const now = new Date()

  const [groupsRes, notifsRes] = await Promise.allSettled([
    getStudentGroupsApi(),
    getNotificationsApi(1),
  ])

  const groups = groupsRes.status === "fulfilled" ? toPaginatedArray(groupsRes.value) : []
  const notifs = notifsRes.status === "fulfilled" ? toPaginatedArray(notifsRes.value) : []
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
