import { TopBar }     from "@/shared/components/layout/topbar"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup }    from "@/shared/types/api"
import { AttendanceRegisterClient } from "./register-client"
import { PwaInstallButton } from "@/features/teacher/components/pwa-install-button"

export default async function AttendanceRegisterPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const session = await getSessionData()

  let group: ApiGroup | null = null
  try {
    group = await serverFetch<ApiGroup>(`/api/groups/${id}`, { revalidate: 120 })
  } catch {
    // graceful
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="كشف الغياب"
        subtitle={group?.name ?? ""}
        notifHref="/teacher/notifications"
        unreadCount={0}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
        actions={<PwaInstallButton groupId={id} groupName={group?.name ?? ""} />}
      />
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <AttendanceRegisterClient groupId={id} />
      </div>
    </div>
  )
}
