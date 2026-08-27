import { TopBar } from "@/shared/components/layout/topbar"
import { currentStudent, currentStudentGroup, getNotificationsByUser, getStudentsByGroup } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"

const notifs = getNotificationsByUser(currentStudent.id)
const unread = notifs.filter(n => !n.read).length
const students = getStudentsByGroup(currentStudentGroup.id)

export default function StudentRankingPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="الترتيب"
        subtitle={currentStudentGroup.name}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={currentStudent.name}
        userAvatar={currentStudent.avatar}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-lg p-4 sm:p-6">
        <p className="mb-1 text-center text-lg font-extrabold">ترتيب أغسطس ٢٠٢٦</p>
        <p className="mb-6 text-center text-xs text-muted-foreground">{currentStudentGroup.name}</p>

        {/* Podium */}
        <div className="mb-6 grid grid-cols-3 items-end gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/10 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
          {[students[1], students[0], students[2]].map((s, i) => {
            if (!s) return <div key={i}/>
            const pos = i === 0 ? 2 : i === 1 ? 1 : 3
            const medals = ["🥇","🥈","🥉"]
            const h = ["h-20","h-28","h-16"][i]
            const isMe = s.id === currentStudent.id
            return (
              <div key={s.id} className="flex flex-col items-center gap-1">
                <span className="text-2xl">{medals[pos-1]}</span>
                <span className={cn("grid size-11 place-items-center rounded-2xl text-sm font-extrabold text-white shadow-sm ring-2",
                  isMe ? "bg-primary ring-primary/40" : pos===1 ? "bg-amber-500 ring-amber-300" : pos===2 ? "bg-slate-400 ring-slate-200" : "bg-amber-700/70 ring-amber-600/30"
                )}>{s.avatar}</span>
                <p className="text-center text-[10px] font-bold leading-tight">{s.name.split(" ")[0]}</p>
                <p className="text-[10px] text-muted-foreground">{s.score} نقطة</p>
                <div className={cn("w-full rounded-t-xl",h,
                  pos===1?"bg-gradient-to-t from-amber-400 to-amber-300":pos===2?"bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600":"bg-gradient-to-t from-amber-700/60 to-amber-600/50")}/>
              </div>
            )
          })}
        </div>

        {/* My rank highlight */}
        {currentStudent.rank > 3 && (
          <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-center">
            <p className="text-sm font-bold text-primary">ترتيبك الحالي: #{currentStudent.rank}</p>
            <p className="text-xs text-muted-foreground">نقاطك: {currentStudent.score} · تحتاج {students[currentStudent.rank - 2]?.score - currentStudent.score + 1} نقطة للمركز #{currentStudent.rank - 1}</p>
          </div>
        )}

        {/* Full list */}
        <div className="space-y-2">
          {students.map((s, i) => {
            const isMe = s.id === currentStudent.id
            return (
              <div key={s.id} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                isMe ? "border-primary/30 bg-primary/5" : i<3 ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10" : "border-border/60 bg-card")}>
                <span className="w-6 text-center shrink-0">{i<3?["🥇","🥈","🥉"][i]:<span className="text-xs font-bold text-muted-foreground">#{i+1}</span>}</span>
                <span className={cn("grid size-8 place-items-center rounded-xl text-xs font-bold shrink-0",
                  isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>{s.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("truncate text-sm", isMe && "font-bold text-primary")}>{s.name}{isMe&&" (أنت)"}</p>
                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full transition-all",isMe?"bg-primary":"bg-violet-300 dark:bg-violet-700")} style={{width:`${(s.score/students[0].score)*100}%`}}/>
                  </div>
                </div>
                <span className={cn("text-sm font-bold shrink-0",isMe?"text-primary":"text-muted-foreground")}>{s.score}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
