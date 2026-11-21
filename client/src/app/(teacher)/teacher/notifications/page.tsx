import { getTeacherNotificationsApi } from "@/features/teacher/apis/teacher.api"
import { NotificationsClient } from "@/features/teacher/components/notifications-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { getSessionData } from "@/shared/lib/session"
import { ApiNotification, PaginatedResponse } from "@/shared/types/api"

export default async function TeacherNotificationsPage() {
  const session = await getSessionData()
  let notifsData: PaginatedResponse<ApiNotification> | null = null
  let unread = 0

  try {
    const res = await getTeacherNotificationsApi(50)
    notifsData = res
    unread = (res.data || []).filter((n) => !n.isRead).length
  } catch {}

  return (
    <div className="flex flex-col">
      <TopBar
        title="الإشعارات"
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />
      <NotificationsClient initialData={notifsData ?? undefined} />
    </div>
  )
}

