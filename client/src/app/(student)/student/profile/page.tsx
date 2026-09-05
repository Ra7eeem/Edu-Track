"use client"

import { TopBar }           from "@/shared/components/layout/topbar"
import { Button }           from "@/shared/components/ui/button"
import { logoutAction }     from "@/features/auth/actions/logout.action"
import {
  useStudentMe,
  useStudentGroups,
  useStudentAttendance,
} from "@/features/student/hooks/use-student"
import { useNotifications } from "@/features/groups/hooks/use-notifications"
import { cn }               from "@/shared/lib/tailwind-cn"
import { LogOut }           from "lucide-react"

export default function StudentProfilePage() {
  const { data: profile   } = useStudentMe()
  const { data: groups    } = useStudentGroups()
  const { data: notifData } = useNotifications()
  const firstGroup          = groups?.data?.[0]
  const { data: attendance} = useStudentAttendance(firstGroup?.id ?? "")
  const unread              = (notifData?.data ?? []).filter(n => !n.isRead).length

  const records = (attendance ?? []) as Array<{ date: string; status: string }>

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

      <div className="mx-auto w-full max-w-lg p-4 sm:p-6 space-y-5">

        {/* Avatar + name */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm text-center">
          <span className="grid size-20 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-3xl font-extrabold text-white shadow-lg">
            {(profile?.name ?? "أ")[0]}
          </span>
          <p className="mt-3 text-base font-bold">{profile?.name}</p>
          <p className="text-sm text-muted-foreground">{firstGroup?.name}</p>
        </div>

        {/* Attendance calendar */}
        {records.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold">
              سجل الحضور —{" "}
              {new Date().toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {records.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
                    r.status === "PRESENT"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {r.status === "PRESENT" ? "✓" : "✗"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account info — read-only, no edit button */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-bold">بيانات الحساب</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">الاسم</span>
              <span className="font-medium">{profile?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/40">
              <span className="text-muted-foreground">البريد الإلكتروني</span>
              <span className="font-medium text-xs">{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">الهاتف</span>
                <span className="font-medium">{profile.phone}</span>
              </div>
            )}
            {(profile as { grade?: string })?.grade && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">الصف</span>
                <span className="font-medium">
                  {(profile as { grade?: string }).grade}
                </span>
              </div>
            )}
          </div>

          {/* Informational note — no edit button */}
          <p className="mt-4 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            لا يمكن تعديل الاسم أو رقم الهاتف — تواصل مع المدرسة لإجراء أي تغيير.
          </p>
        </div>

        {/* Logout */}
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </form>

      </div>
    </div>
  )
}
