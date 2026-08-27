import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { currentTeacher, mockGroups, mockNotifications } from "@/shared/data/mock"
import { BookOpen, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

const teacherGroups = mockGroups.filter(g => g.teacherIds.includes(currentTeacher.id))
const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

const coverColors: Record<string, string> = {
  violet: "from-violet-500 to-violet-600",
  cyan:   "from-cyan-500 to-cyan-600",
  amber:  "from-amber-500 to-amber-600",
  emerald:"from-emerald-500 to-emerald-600",
  rose:   "from-rose-500 to-rose-600",
}

export default function TeacherGroupsPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="مجموعاتي"
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{teacherGroups.length} مجموعات</p>
        </div>

        {teacherGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-3 size-10 text-muted-foreground/40"/>
            <p className="font-medium">لا توجد مجموعات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">تواصل مع الإدارة لإنشاء مجموعتك الأولى</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {teacherGroups.map(g => (
              <div key={g.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={`h-2 bg-gradient-to-r ${coverColors[g.cover] ?? "from-violet-500 to-violet-600"}`}/>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-bold">{g.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">{g.subject}</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3">
                    <div className="text-center">
                      <p className="text-base font-bold text-primary">{g.studentCount}</p>
                      <p className="text-[10px] text-muted-foreground">طالب</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-emerald-600">{g.attendanceRate}٪</p>
                      <p className="text-[10px] text-muted-foreground">حضور</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-cyan-600">{g.postCount}</p>
                      <p className="text-[10px] text-muted-foreground">منشور</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{g.schedule}</span>
                    <span>آخر نشاط: {g.lastActivity}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teacher/group/${g.id}/attendance`}>
                        <Users className="size-3.5"/>تسجيل الحضور
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
                      <Link href={`/teacher/group/${g.id}`}>
                        <TrendingUp className="size-3.5"/>إدارة المجموعة
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
