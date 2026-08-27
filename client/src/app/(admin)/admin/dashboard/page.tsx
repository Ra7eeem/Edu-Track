import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { mockGroups, mockStudents, mockTeachers, mockPosts, mockNotifications } from "@/shared/data/mock"
import { ArrowLeft, BarChart3, BookOpen, CalendarCheck, MessageCircle, TrendingUp, Users, XCircle } from "lucide-react"
import Link from "next/link"

const totalStudents = mockStudents.length
const totalTeachers = mockTeachers.length
const totalGroups   = mockGroups.length
const totalPosts    = mockPosts.length
const avgAttendance = Math.round(mockGroups.reduce((s,g) => s + g.attendanceRate, 0) / mockGroups.length)

const coverColors: Record<string, string> = {
  violet:"from-violet-500 to-violet-600", cyan:"from-cyan-500 to-cyan-600",
  amber:"from-amber-500 to-amber-600", emerald:"from-emerald-500 to-emerald-600", rose:"from-rose-500 to-rose-600",
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="لوحة الإدارة"
        subtitle="مدير النظام"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "المدرسون",     value: totalTeachers,   icon: Users,         color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20"   },
            { label: "الطلاب",      value: totalStudents,   icon: Users,         color: "text-cyan-600",   bg: "bg-cyan-50 dark:bg-cyan-900/20"        },
            { label: "المجموعات",   value: totalGroups,     icon: BookOpen,      color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20"  },
            { label: "حضور اليوم",  value: 27,              icon: CalendarCheck, color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20"  },
            { label: "غياب اليوم",  value: 8,               icon: XCircle,       color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-900/20"        },
            { label: "المنشورات",   value: totalPosts,      icon: MessageCircle, color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20"      },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className={`mb-2 inline-grid size-8 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="size-3.5"/>
              </div>
              <p className="text-xl font-extrabold">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Overview charts row — simplified visual */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Attendance rate by group */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">نسبة الحضور بالمجموعة</h3>
              <BarChart3 className="size-4 text-muted-foreground"/>
            </div>
            <div className="space-y-3">
              {mockGroups.map(g => (
                <div key={g.id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="truncate max-w-[160px] text-muted-foreground">{g.name.split("—")[0].trim()}</span>
                    <span className="font-bold text-foreground">{g.attendanceRate}٪</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className={`h-full bg-gradient-to-r ${coverColors[g.cover] ?? "from-violet-500 to-violet-600"} transition-all`} style={{width:`${g.attendanceRate}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top teachers */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">المدرسون الأكثر نشاطاً</h3>
              <TrendingUp className="size-4 text-muted-foreground"/>
            </div>
            <div className="space-y-3">
              {mockTeachers.slice(0,4).map((t,i) => (
                <div key={t.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">#{i+1}</span>
                  <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{t.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.groupIds.length} مجموعات · {t.studentCount} طالب</p>
                  </div>
                  <Badge variant={t.status === "active" ? "secondary" : "outline"} className="text-[10px] shrink-0">
                    {t.status === "active" ? "نشط" : "غير نشط"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Groups list */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">جميع المجموعات</h2>
            <Link href="/admin/groups" className="flex items-center gap-1 text-xs text-primary hover:underline">
              عرض الكل <ArrowLeft className="size-3"/>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockGroups.map(g => (
              <div key={g.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className={`h-1.5 bg-gradient-to-r ${coverColors[g.cover] ?? "from-violet-500 to-violet-600"}`}/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs font-bold leading-snug">{g.name}</h3>
                    <Badge variant="secondary" className="text-[10px] shrink-0">{g.subject}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>{g.studentCount} طالب</span>
                    <span>{g.attendanceRate}٪ حضور</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{g.lastActivity}</span>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                      <Link href={`/admin/group/${g.id}`}>تفاصيل</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
