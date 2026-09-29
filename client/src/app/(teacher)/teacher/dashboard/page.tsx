import { TopBar }      from "@/shared/components/layout/topbar"
import { Button }      from "@/shared/components/ui/button"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification } from "@/shared/types/api"
import { ArrowLeft, BookOpen, CalendarCheck, Users, XCircle } from "lucide-react"
import Link from "next/link"

interface TeacherDashboardData {
  groups:        ApiGroup[]
  notifications: (ApiNotification & { isRead: boolean })[]
  unreadCount:   number
  todayPresent:  number
  todayAbsent:   number
}

const COLORS = [
  "from-teal-500 to-teal-600",   "from-amber-400 to-amber-500",
  "from-emerald-500 to-emerald-600", "from-cyan-500 to-cyan-600",
  "from-rose-500 to-rose-600",
]

export default async function TeacherDashboard() {
  const session = await getSessionData()

  // Single request — all dashboard data. Endpoint is user-scoped (one URL for
  // every teacher) → never cache it server-side or it can leak across teachers.
  let data: TeacherDashboardData | null = null
  try {
    data = await serverFetch<TeacherDashboardData>("/api/teacher/dashboard")
  } catch {
    // graceful fallback
  }

  const groups   = data?.groups        ?? []
  const notifs   = data?.notifications ?? []
  const unread   = data?.unreadCount   ?? 0

  const totalStudents  = groups.reduce(
    (s, g) => s + ((g as unknown as { studentsCount?: number }).studentsCount ?? 0), 0
  )
  const todayPresent = data?.todayPresent ?? 0
  const todayAbsent  = data?.todayAbsent  ?? 0
  const hasToday     = data !== null && (todayPresent + todayAbsent) > 0

  return (
    <div className="flex flex-col">
      <TopBar
        title="الرئيسية"
        subtitle={`مرحباً، ${session?.name ?? ""}`}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-teal-600"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "المجموعات",     value: groups.length,                 icon: BookOpen,      color: "text-teal-600",    bg: "bg-teal-50 dark:bg-teal-900/20", href: "/teacher/groups" },
            { label: "إجمالي الطلاب", value: totalStudents,                 icon: Users,         color: "text-cyan-600",    bg: "bg-cyan-50 dark:bg-cyan-900/20", href: "/teacher/groups" },
            { label: "حضور اليوم",    value: hasToday ? todayPresent : "—", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", href: "/teacher/groups" },
            { label: "غياب اليوم",    value: hasToday ? todayAbsent  : "—", icon: XCircle,       color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20", href: "/teacher/groups" },
          ].map((s) => {
            const CardContent = (
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md h-full">
                <div className={`mb-3 inline-grid size-9 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon className="size-4" />
                </div>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
              </div>
            );
            return s.href ? (
              <Link key={s.label} href={s.href} className="block">
                {CardContent}
              </Link>
            ) : (
              <div key={s.label}>
                {CardContent}
              </div>
            );
          })}
        </div>

        {/* Groups */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">مجموعاتي</h2>
            <Link href="/teacher/groups" className="flex items-center gap-1 text-xs text-primary hover:underline">
              عرض الكل <ArrowLeft className="size-3" />
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
              <BookOpen className="mb-3 size-10 text-muted-foreground/30" />
              <p className="text-sm font-medium">لا توجد مجموعات بعد</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groups.map((g, i) => (
                <div key={g._id} className="group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className={`h-1.5 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                  <div className="p-4">
                    <h3 className="text-sm font-bold leading-snug">{g.name}</h3>
                    {g.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{g.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(g.updatedAt).toLocaleDateString("ar-EG")}
                      </span>
                      <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                        <Link href={`/teacher/group/${g._id}`}>إدارة</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent notifications */}
        {notifs.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">آخر الإشعارات</h2>
              <Link href="/teacher/notifications" className="flex items-center gap-1 text-xs text-primary hover:underline">
                عرض الكل <ArrowLeft className="size-3" />
              </Link>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
              {notifs.map((n, i) => (
                <div key={String(n._id ?? n.id)} className={`flex items-start gap-3 px-4 py-3 ${i < notifs.length - 1 ? "border-b border-border/40" : ""}`}>
                  <span className={`mt-0.5 size-2 shrink-0 rounded-full ${n.isRead ? "bg-muted" : "bg-primary"}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
