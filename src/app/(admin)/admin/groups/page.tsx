import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { mockGroups, mockTeachers } from "@/shared/data/mock"
import { BookOpen, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

const coverColors: Record<string, string> = {
  violet:"from-violet-500 to-violet-600", cyan:"from-cyan-500 to-cyan-600",
  amber:"from-amber-500 to-amber-600", emerald:"from-emerald-500 to-emerald-600", rose:"from-rose-500 to-rose-600",
}

export default function AdminGroupsPage() {
  return (
    <div className="flex flex-col">
      <TopBar title="المجموعات" notifHref="/admin/dashboard" userName="مدير" userAvatar="ا" userAvatarColor="bg-rose-500" profileHref="/admin/dashboard"/>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-muted-foreground">{mockGroups.length} مجموعات في النظام</p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockGroups.map(g => {
            const teachers = g.teacherIds.map(tid => mockTeachers.find(t => t.id === tid)).filter(Boolean)
            return (
              <div key={g.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className={`h-2 bg-gradient-to-r ${coverColors[g.cover] ?? "from-violet-500 to-violet-600"}`}/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold leading-snug">{g.name}</h3>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">{g.subject}</Badge>
                  </div>

                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    {teachers.map(t => t && (
                      <span key={t.id} className="flex items-center gap-1">
                        <span className="grid size-5 place-items-center rounded bg-violet-100 text-[10px] font-bold text-violet-600 dark:bg-violet-900/30">{t.avatar}</span>
                        {t.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center">
                    <div><p className="text-sm font-bold">{g.studentCount}</p><p className="text-[10px] text-muted-foreground">طالب</p></div>
                    <div><p className="text-sm font-bold text-emerald-600">{g.attendanceRate}٪</p><p className="text-[10px] text-muted-foreground">حضور</p></div>
                    <div><p className="text-sm font-bold text-cyan-600">{g.postCount}</p><p className="text-[10px] text-muted-foreground">منشور</p></div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{g.schedule}</span>
                    <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                      <Link href={`/admin/group/${g.id}`}>تفاصيل</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
