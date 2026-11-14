import { getNotificationsApi } from "@/features/student/apis/student.api"
import { NotificationsClient } from "@/features/teacher/components/notifications-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { getSessionData } from "@/shared/lib/session"
import { ApiNotification, PaginatedResponse } from "@/shared/types/api"

export default async function StudentNotificationsPage() {
  const session = await getSessionData()
  let notifsData: PaginatedResponse<ApiNotification> | null = null
  let unread = 0

  try {
    const res = await getNotificationsApi(50)
    notifsData = res
    unread = (res.data || []).filter((n) => !n.isRead).length
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
      <NotificationsClient initialData={notifsData ?? undefined} />
    </div>
  )
}
