import { StudentsClient } from "@/features/teacher/components/students-client"
import { TopBar } from "@/shared/components/layout/topbar"
import {
  getGroupStudentsApi,
  getTeacherGroupByIdApi,
  getTeacherNotificationsApi,
} from "@/features/teacher/apis/teacher.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup } from "@/shared/types/api"
import { type GroupStudent } from "@/features/teacher/hooks/use-group-students"

export default async function StudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, studentsRes, notifsRes] = await Promise.allSettled([
    getTeacherGroupByIdApi(id),
    getGroupStudentsApi(id, 100),
    getTeacherNotificationsApi(1),
  ])

  const rawGroup = groupRes.status === "fulfilled" ? groupRes.value : null
  const group = rawGroup ? ("group" in rawGroup ? rawGroup.group : rawGroup) as ApiGroup : null
  const students: GroupStudent[] = studentsRes.status === "fulfilled"
    ? toPaginatedArray(studentsRes.value)
    : []
  const unread = notifsRes.status === "fulfilled"
    ? toPaginatedArray(notifsRes.value).filter((n) => !n.isRead).length
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
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />
      <StudentsClient groupId={id} initialStudents={students} />
    </div>
  )
}
