import type { Metadata } from "next"
import { AttendanceClient } from "@/features/teacher/components/attendance-client"
import { PwaInstallButton } from "@/features/teacher/components/pwa-install-button"
import { TopBar }           from "@/shared/components/layout/topbar"
import { getGroupStudentsApi, getTeacherGroupByIdApi, getTeacherNotificationsApi } from "@/features/teacher/apis/teacher.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData }   from "@/shared/lib/session"
import { ApiGroup, ApiGroupMembership, ApiNotification } from "@/shared/types/api"

// ─── Dynamic metadata so the browser picks up the group-specific manifest ──────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id }    = await params
  const session   = await getSessionData()

  let groupName   = "المجموعة"
  const teacherName = session?.name ?? "المدرس"

  try {
    const g = await getTeacherGroupByIdApi(id)
    if ("name" in g && g.name) groupName = g.name
    else if ("group" in g && g.group?.name) groupName = g.group.name
  } catch { /* use defaults */ }

  return {
    title:    `حضور — ${groupName}`,
    manifest: `/api/pwa/manifest/${id}`,
    appleWebApp: {
      capable:        true,
      statusBarStyle: "default",
      title:          `${groupName} — ${teacherName}`,
    },
  }
}

export default async function AttendancePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, studentsRes, notifsRes] = await Promise.allSettled([
    getTeacherGroupByIdApi(id),
    getGroupStudentsApi(id, 100),
    getTeacherNotificationsApi(1),
  ])

  const rawGroup = groupRes.status === "fulfilled" ? groupRes.value : null
  const group = rawGroup ? ("group" in rawGroup ? rawGroup.group : rawGroup) as ApiGroup : null
  const rawStudents = studentsRes.status === "fulfilled" ? toPaginatedArray(studentsRes.value) : []
  const unread = notifsRes.status === "fulfilled"
    ? toPaginatedArray(notifsRes.value).filter((n) => !n.isRead).length
    : 0

  const students = rawStudents
    .map(s => {
      const user =
        (s as unknown as { student?: { _id?: string; id?: string; name?: string } })
          .student ?? (s as unknown as { _id?: string; id?: string; name?: string })
      const sid  = user._id ?? user.id ?? ""
      const name = user.name ?? ""
      return { id: sid, name, avatar: name ? name[0] : "؟" }
    })
    .filter(s => s.id)

  const groupName = group?.name ?? ""

  return (
    <div className="flex flex-col">
      <TopBar
        title="تسجيل الحضور"
        subtitle={groupName}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
        actions={
          <PwaInstallButton groupId={id} />
        }
      />
      <AttendanceClient groupId={id} students={students} />
    </div>
  )
}
