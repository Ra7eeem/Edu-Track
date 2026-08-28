import { NotificationsClient } from "@/features/teacher/components/notifications-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiNotification, PaginatedResponse } from "@/shared/types/api"

export default async function StudentNotificationsPage() {
  const session = await getSessionData()
  let notifs: ApiNotification[] = []
  let unread = 0

  try {
    const res = await serverFetch<PaginatedResponse<ApiNotification>>(
      "/api/notifications?limit=50"
    )
    notifs = res.data
    unread = notifs.filter((n) => !n.isRead).length
  } catch {}

  return (
    <div className="flex flex-col">
      <TopBar
        title="الإشعارات"
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "أ")[0]}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />
      <NotificationsClient initialNotifs={notifs} />
    </div>
  )
}
