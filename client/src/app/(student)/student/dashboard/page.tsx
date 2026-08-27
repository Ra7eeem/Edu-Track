import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  currentStudent,
  currentStudentGroup,
  getNotificationsByUser,
  getPostsByGroup,
  getStudentsByGroup,
  mockTeachers,
} from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { ArrowLeft, CalendarCheck, Heart, MessageCircle, Trophy, XCircle } from "lucide-react"
import Link from "next/link"

const notifs = getNotificationsByUser(currentStudent.id)
const unread = notifs.filter(n => !n.read).length
const posts = getPostsByGroup(currentStudentGroup.id).slice(0, 3)
const groupStudents = getStudentsByGroup(currentStudentGroup.id)
const teacher = mockTeachers.find(t => currentStudentGroup.teacherIds.includes(t.id))

export default function StudentDashboard() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="الرئيسية"
        subtitle={`مرحباً، ${currentStudent.name.split(" ")[0]}`}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={currentStudent.name}
        userAvatar={currentStudent.avatar}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
        {/* Group banner */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 p-5 text-white shadow-lg shadow-violet-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-violet-200">مجموعتي</p>
              <h2 className="mt-0.5 text-base font-bold">{currentStudentGroup.name}</h2>
              <p className="mt-0.5 text-xs text-violet-200">{currentStudentGroup.schedule}</p>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-xs">{currentStudentGroup.subject}</Badge>
          </div>
          <Button size="sm" className="mt-4 bg-white text-violet-700 hover:bg-white/90" asChild>
            <Link href="/student/group">فتح المجموعة</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "حضور هذا الشهر", value: currentStudent.attendanceCount, icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "أيام الغياب",     value: currentStudent.absenceCount,   icon: XCircle,       color: "text-rose-600",   bg: "bg-rose-50 dark:bg-rose-900/20"     },
            { label: "نقاطي",          value: currentStudent.score,           icon: Trophy,        color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20"   },
            { label: "ترتيبي في المجموعة", value: `#${currentStudent.rank}`, icon: Trophy,        color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className={cn("mb-2 inline-grid size-8 place-items-center rounded-xl", s.bg, s.color)}>
                <s.icon className="size-4"/>
              </div>
              <p className={cn("text-2xl font-extrabold", s.color)}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Ranking preview */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">الترتيب الحالي</h2>
            <Link href="/student/ranking" className="flex items-center gap-1 text-xs text-primary hover:underline">
              عرض الكل <ArrowLeft className="size-3"/>
            </Link>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border/40">
              ترتيب أغسطس ٢٠٢٦
            </div>
            {groupStudents.slice(0, 5).map((s, i) => {
              const isMe = s.id === currentStudent.id
              return (
                <div key={s.id} className={cn("flex items-center gap-3 px-4 py-3 transition-colors", isMe && "bg-primary/5 border-s-2 border-primary", i < 4 && "border-b border-border/40")}>
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground">
                    {i < 3 ? ["🥇","🥈","🥉"][i] : `#${i+1}`}
                  </span>
                  <span className={cn("grid size-8 place-items-center rounded-xl text-xs font-bold shrink-0", isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                    {s.avatar}
                  </span>
                  <span className={cn("flex-1 text-sm truncate", isMe && "font-bold text-primary")}>
                    {s.name} {isMe && "(أنت)"}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground shrink-0">{s.score} نقطة</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Recent posts */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">آخر منشورات المجموعة</h2>
            <Link href="/student/group" className="flex items-center gap-1 text-xs text-primary hover:underline">
              عرض الكل <ArrowLeft className="size-3"/>
            </Link>
          </div>
          <div className="space-y-3">
            {posts.map(p => (
              <article key={p.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600">{teacher?.avatar}</span>
                  <div>
                    <p className="text-xs font-semibold">{teacher?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.createdAt}</p>
                  </div>
                  {p.pinned && <Badge className="ms-auto bg-amber-100 text-amber-700 border-0 text-[10px] dark:bg-amber-900/30 dark:text-amber-300">📌</Badge>}
                </div>
                <p className="text-xs leading-relaxed text-foreground line-clamp-3">{p.content}</p>
                <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="size-3"/>{p.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="size-3"/>{p.commentCount}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
