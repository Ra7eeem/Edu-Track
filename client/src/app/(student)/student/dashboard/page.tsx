import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { LandingStarPattern } from "@/shared/components/star-pattern"
import { getStudentDashboardApi } from "@/features/student/apis/student.api"
import type { StudentDashboardData } from "@/features/student/types/student"
import { getSessionData } from "@/shared/lib/session"
import { resolveId } from "@/shared/types/api"
import { DashboardPostsFeed } from "./posts-feed"
import { StudentTeamCard } from "@/features/student/components/student-team-card"
import { StudentTaskBar } from "@/features/student/components/student-task-bar"
import { ArrowLeft, CalendarCheck, Trophy, XCircle } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const session = await getSessionData()

  let data: StudentDashboardData | null = null
  try {
    data = await getStudentDashboardApi()
  } catch {
    // graceful fallback
  }

  const name       = data?.student?.name ?? session?.name ?? ""
  const avatar     = name[0] ?? "؟"
  const unread     = data?.unreadCount ?? 0
  const firstGroup = data?.firstGroup ?? null
  const posts      = data?.posts      ?? []
  const rankData   = data?.rank       ?? null

  return (
    <div className="flex flex-col font-sans">
      <TopBar
        title="الرئيسية"
        subtitle={`مرحباً، ${name.split(" ")[0]}`}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={name}
        userAvatar={avatar}
        userAvatarColor="bg-primary text-primary-foreground"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
        {/* Group banner — emerald & gold brand */}
        {firstGroup && (
          <div className="relative overflow-hidden rounded border border-border bg-primary text-primary-foreground p-5 shadow-sm">
            <div className="absolute top-0 end-0 size-36 opacity-25 pointer-events-none">
              <LandingStarPattern />
            </div>
            <p className="relative text-xs font-semibold text-[var(--goldOnG,#E3B84F)]">مجموعتي</p>
            <h2 className="relative mt-1 font-display text-xl font-bold">{(firstGroup as { name?: string }).name ?? ""}</h2>
            <Button
              size="sm"
              className="relative mt-4 bg-[var(--goldOnG,#E3B84F)] text-[var(--onG,#0E1B19)] border-0 font-bold hover:brightness-110"
              asChild
            >
              <Link href="/student/group">فتح المجموعة</Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "حضور هذا الشهر", value: rankData?.presentCount ?? "—", icon: CalendarCheck, color: "text-primary", bg: "bg-primary/10", href: "/student/group" },
            { label: "أيام الغياب",    value: rankData?.absentCount  ?? "—", icon: XCircle,       color: "text-destructive", bg: "bg-destructive/10", href: "/student/group" },
            { label: "نقاطي",          value: rankData?.score        ?? "—", icon: Trophy,        color: "text-accent",   bg: "bg-accent/10", href: "/student/group" },
            { label: "ترتيبي",         value: rankData ? `#${rankData.rank}` : "—", icon: Trophy, color: "text-primary",   bg: "bg-primary/10", href: "/student/group" },
          ].map((s) => {
            const CardContent = (
              <div className="rounded border border-border bg-card p-4 shadow-sm transition-all hover:border-accent h-full">
                <div className={`mb-2 inline-grid size-8 place-items-center rounded ${s.bg} ${s.color}`}>
                  <s.icon className="size-4" />
                </div>
                <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
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

        {/* Gamified Team & Rank Card */}
        <StudentTeamCard classroomId={firstGroup ? resolveId(firstGroup) : null} />

        {/* Private Student Task & Progress Bar */}
        <StudentTaskBar />

        {/* Recent posts */}
        {posts.length > 0 && firstGroup && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-heading">آخر منشورات المجموعة</h2>
              <Link href="/student/group" className="flex items-center gap-1 text-xs text-accent hover:underline">
                عرض الكل <ArrowLeft className="size-3" />
              </Link>
            </div>
            <DashboardPostsFeed
              posts={posts}
              groupId={resolveId(firstGroup as { _id?: string; id?: string })}
            />
          </section>
        )}
      </div>
    </div>
  )
}
