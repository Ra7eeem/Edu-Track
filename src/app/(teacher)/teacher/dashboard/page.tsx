import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  currentTeacher,
  mockGroups,
  mockNotifications,
  mockStudents,
} from "@/shared/data/mock"
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarCheck,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"
import Link from "next/link"

const teacherGroups = mockGroups.filter(g => g.teacherIds.includes(currentTeacher.id))
const totalStudents = teacherGroups.reduce((s, g) => s + g.studentCount, 0)
const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

const coverColors: Record<string, string> = {
  violet: "from-violet-500 to-violet-600",
  cyan:   "from-cyan-500 to-cyan-600",
  amber:  "from-amber-500 to-amber-600",
  emerald:"from-emerald-500 to-emerald-600",
  rose:   "from-rose-500 to-rose-600",
}

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="الرئيسية"
        subtitle={`مرحباً، ${currentTeacher.name}`}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "المجموعات",    value: teacherGroups.length, icon: BookOpen,      color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
            { label: "إجمالي الطلاب",value: totalStudents,        icon: Users,         color: "text-cyan-600",   bg: "bg-cyan-50 dark:bg-cyan-900/20"     },
            { label: "حضور اليوم",   value: 27,                   icon: CalendarCheck, color: "text-emerald-600",bg: "bg-emerald-50 dark:bg-emerald-900/20"},
            { label: "غياب اليوم",   value: 5,                    icon: XCircle,       color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-900/20"     },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className={`mb-3 inline-grid size-9 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="size-4"/>
              </div>
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90">
            <Link href="/teacher/groups"><BookOpen className="size-3.5"/>مجموعاتي</Link>
          </Button>
          <Button size="sm" variant="outline">
            <Link href="/teacher/notifications"><BarChart3 className="size-3.5"/>الإشعارات</Link>
          </Button>
        </div>

        {/* Groups */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">مجموعاتي</h2>
            <Link href="/teacher/groups" className="flex items-center gap-1 text-xs text-primary hover:underline">
              عرض الكل <ArrowLeft className="size-3"/>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {teacherGroups.map(g => (
              <div key={g.id} className="group rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
                {/* Cover strip */}
                <div className={`h-1.5 bg-gradient-to-r ${coverColors[g.cover] ?? "from-violet-500 to-violet-600"}`}/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold leading-snug">{g.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.schedule}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-xs">{g.subject}</Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="size-3"/>{g.studentCount} طالب</span>
                    <span className="flex items-center gap-1"><TrendingUp className="size-3"/>{g.attendanceRate}٪ حضور</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">آخر نشاط: {g.lastActivity}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Link href={`/teacher/group/${g.id}`}>إدارة</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent students */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">آخر الطلاب نشاطاً</h2>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            {mockStudents.slice(0, 5).map((s, i) => (
              <div key={s.id} className={`flex items-center gap-3 px-4 py-3 ${i < 4 ? "border-b border-border/40" : ""}`}>
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                  {s.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.attendanceCount} حضور · {s.absenceCount} غياب</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-bold text-primary">{s.score}</p>
                  <p className="text-[10px] text-muted-foreground">نقطة</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
