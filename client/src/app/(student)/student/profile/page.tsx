import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { logoutAction } from "@/features/auth/actions/logout.action"
import { serverFetch } from "@/shared/lib/api-server"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  ApiGroup,
  ApiNotification,
  ApiUser,
  PaginatedResponse,
  resolveId,
} from "@/shared/types/api"
import { LogOut } from "lucide-react"

type AttendanceRecord = { date: string; status: string }

export default async function StudentProfilePage() {
  const [profile, groupsResponse, notificationsResponse] = await Promise.all([
    serverFetch<ApiUser>("/api/students/me").catch(() => null),
    serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>("/api/students/me/groups").catch(() => null),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=50").catch(() => null),
  ])

  const groups = toPaginatedArray<ApiGroup>(groupsResponse)
  const firstGroup = groups[0]
  const attendance = firstGroup
    ? await serverFetch<AttendanceRecord[]>(
        `/api/students/me/groups/${resolveId(firstGroup)}/attendance`
      ).catch(() => [])
    : []
  const notifications = toPaginatedArray<ApiNotification>(notificationsResponse)
  const unread = notifications.filter(notification => !notification.isRead).length
  const records = attendance

  return (
    <div className="flex flex-col">
      <TopBar
        title="حسابي"
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={profile?.name ?? ""}
        userAvatar={(profile?.name ?? "أ")[0]}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-lg space-y-5 p-4 sm:p-6">
        <div className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-sm">
          <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-3xl font-extrabold text-white shadow-lg">
            {(profile?.name ?? "أ")[0]}
          </span>
          <p className="mt-3 text-base font-bold">{profile?.name}</p>
          <p className="text-sm text-muted-foreground">{firstGroup?.name}</p>
        </div>

        {records.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold">
              سجل الحضور —{" "}
              {new Date().toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {records.map((record, index) => (
                <div
                  key={`${record.date}-${index}`}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
                    record.status === "PRESENT"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {record.status === "PRESENT" ? "✓" : "✗"}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold">بيانات الحساب</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-border/40 py-2">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-medium">{profile?.name}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-2">
              <span className="text-muted-foreground">البريد الإلكتروني</span>
              <span className="text-xs font-medium">{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex justify-between border-b border-border/40 py-2">
                <span className="text-muted-foreground">الهاتف</span>
                <span className="font-medium">{profile.phone}</span>
              </div>
            )}
            {profile?.grade && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">الصف</span>
                <span className="font-medium">{profile.grade}</span>
              </div>
            )}
          </div>

          <p className="mt-4 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            لا يمكن تعديل الاسم أو رقم الهاتف — تواصل مع المدرسة لإجراء أي تغيير.
          </p>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </form>
      </div>
    </div>
  )
}
