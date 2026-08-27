import { TopBar } from "@/shared/components/layout/topbar"
import { currentTeacher, getGroupById, getStudentsByGroup, mockNotifications } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"

const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

export default async function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const group = getGroupById(id)
  const students = getStudentsByGroup(id)

  return (
    <div className="flex flex-col">
      <TopBar
        title="الترتيب"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold">ترتيب أغسطس ٢٠٢٦</h2>
          <span className="text-xs text-muted-foreground">{students.length} طالب</span>
        </div>

        {/* Top 3 podium */}
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/20 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
          {[students[1], students[0], students[2]].map((s, i) => {
            if (!s) return <div key={i}/>
            const pos = i === 0 ? 2 : i === 1 ? 1 : 3
            const medals = ["🥇","🥈","🥉"]
            const heights = ["h-20","h-24","h-16"]
            return (
              <div key={s.id} className={cn("flex flex-col items-center justify-end gap-1", i === 1 && "-mt-3")}>
                <span className="text-xl">{medals[pos-1]}</span>
                <span className="grid size-10 place-items-center rounded-xl bg-white text-sm font-bold text-violet-600 shadow-sm dark:bg-card">{s.avatar}</span>
                <p className="text-center text-[10px] font-semibold leading-tight">{s.name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{s.score} نقطة</p>
                <div className={cn("w-full rounded-t-xl bg-gradient-to-t",heights[i],
                  pos===1?"from-amber-400 to-amber-300":pos===2?"from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-500":"from-amber-700/60 to-amber-600/60"
                )}/>
              </div>
            )
          })}
        </div>

        {/* Full list */}
        <div className="space-y-2">
          {students.map((s, i) => (
            <div key={s.id} className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
              i < 3 ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10" : "border-border/60 bg-card"
            )}>
              <span className="w-6 text-center text-sm font-bold text-muted-foreground shrink-0">
                {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
              </span>
              <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{s.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <div className="mt-0.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all" style={{width:`${(s.score/students[0].score)*100}%`}}/>
                </div>
              </div>
              <span className="text-sm font-bold text-primary shrink-0">{s.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
