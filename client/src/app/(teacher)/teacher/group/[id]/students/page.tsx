import { StudentsClient } from "@/features/teacher/components/students-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, PaginatedResponse } from "@/shared/types/api"
import { type GroupStudent } from "@/features/teacher/hooks/use-group-students"

function extractArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>
    if (Array.isArray(r.data))  return r.data  as T[]
    if (Array.isArray(r.docs))  return r.docs  as T[]
    if (Array.isArray(r.items)) return r.items as T[]
  }
  return []
}

export default async function StudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, studentsRes, notifsRes] = await Promise.allSettled([
    serverFetch<ApiGroup>(`/api/groups/${id}`),
    serverFetch<PaginatedResponse<GroupStudent> | GroupStudent[]>(
      `/api/teacher/groups/${id}/students?limit=100`
    ),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const group    = groupRes.status    === "fulfilled" ? groupRes.value    : null
  const students = studentsRes.status === "fulfilled"
    ? extractArray<GroupStudent>(studentsRes.value)
    : []
  const unread   = notifsRes.status   === "fulfilled"
    ? extractArray<ApiNotification>(notifsRes.value).filter(n => !n.isRead).length
    : 0

  return (
    <div className="flex flex-col">
      <TopBar
        title="الطلاب"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />
      <StudentsClient groupId={id} initialStudents={students} />
    </div>
  )
}
