import { TopBar }    from "@/shared/components/layout/topbar"
import { Button }    from "@/shared/components/ui/button"
import { serverFetch } from "@/shared/lib/api-server"
import { AdminDashboardStats, ApiGroup, ApiUser } from "@/shared/types/api"
import { BookOpen, CalendarCheck, MessageCircle, Users, XCircle } from "lucide-react"
import Link from "next/link"

interface DashboardFull {
  stats:    AdminDashboardStats
  teachers: ApiUser[]
  groups:   ApiGroup[]
}

const COLORS = [
  "from-violet-500 to-violet-600", "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",   "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

export default async function AdminDashboard() {
  // Single request — all dashboard data in one roundtrip
  let data: DashboardFull | null = null
  try {
    data = await serverFetch<DashboardFull>("/api/admin/dashboard-full", {
      revalidate: 120,
      tags: ["admin-dashboard"],
    })
  } catch {
    // graceful degradation — show empty state
  }

  const stats    = data?.stats
  const groups   = data?.groups   ?? []
  const teachers = data?.teachers ?? []

  return (
    <div className="flex flex-col">
      <TopBar
        title="لوحة الإدارة"
        subtitle="مدير النظام"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "المدرسون",    value: stats?.totalTeachers ?? "—", icon: Users,         color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20"  },
            { label: "الطلاب",     value: stats?.totalStudents ?? "—", icon: Users,         color: "text-cyan-600",    bg: "bg-cyan-50 dark:bg-cyan-900/20"       },
            { label: "المجموعات",  value: stats?.totalGroups   ?? "—", icon: BookOpen,      color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "حضور اليوم", value: stats?.todayPresent  ?? "—", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "غياب اليوم", value: stats?.todayAbsent   ?? "—", icon: XCircle,       color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20"       },
            { label: "المنشورات",  value: stats?.totalPosts    ?? "—", icon: MessageCircle, color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20"     },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className={`mb-2 inline-grid size-8 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="size-3.5" />
              </div>
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Teachers */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">المدرسون</h3>
              <Link href="/admin/teachers" className="text-xs text-primary hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-3">
              {teachers.map((t, i) => (
                <div key={String(t._id ?? t.id)} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{i + 1}</span>
                  <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                    {t.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{t.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{t.email}</p>
                  </div>
                  <span className={`text-[10px] rounded-full px-2 py-0.5 ${t.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700"}`}>
                    {t.isActive ? "نشط" : "غير نشط"}
                  </span>
                </div>
              ))}
              {teachers.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">لا يوجد مدرسون</p>
              )}
            </div>
          </div>

          {/* Groups */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">المجموعات</h3>
              <Link href="/admin/groups" className="text-xs text-primary hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-2">
              {groups.map((g, i) => (
                <div key={String(g._id ?? g.id)} className="overflow-hidden rounded-xl border border-border/40">
                  <div className={`h-1 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="truncate text-xs font-medium">{g.name}</p>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] shrink-0 ms-2" asChild>
                      <Link href={`/admin/group/${g._id}`}>تفاصيل</Link>
                    </Button>
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">لا توجد مجموعات</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
