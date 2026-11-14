import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { getStudentDashboardApi } from "@/features/student/apis/student.api"
import type { StudentDashboardData } from "@/features/student/types/student"
import { getSessionData } from "@/shared/lib/session"
import { resolveId } from "@/shared/types/api"
import { DashboardPostsFeed } from "./posts-feed"
import { ArrowLeft, CalendarCheck, Trophy, XCircle } from "lucide-react"
import Link from "next/link"

export default async function StudentDashboard() {
  const session = await getSessionData()

  // Single request — all dashboard data. Endpoint is user-scoped (one URL for
  // every student) → never cache it server-side or it can leak across students.
  let data: StudentDashboardData | null = null
  try {
    data = await getStudentDashboardApi()
  } catch {
    // graceful fallback — show session data
  }

  const name       = data?.student?.name ?? session?.name ?? ""
  const avatar     = name[0] ?? "؟"
  const unread     = data?.unreadCount ?? 0
  const firstGroup = data?.firstGroup ?? null
  const posts      = data?.posts      ?? []
  const rankData   = data?.rank       ?? null

  return (
    <div className="flex flex-col">
      <TopBar
        title="الرئيسية"
        subtitle={`مرحباً، ${name.split(" ")[0]}`}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={name}
        userAvatar={avatar}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
        {/* Group banner — navy/gold brand */}
        {firstGroup && (
          <div
            className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #1B2A4A 0%, #1E3057 60%, #0C3B5E 100%)" }}
          >
            {/* Subtle gold border */}
            <div className="absolute inset-0 rounded-2xl" style={{ border: "1px solid rgba(201,168,76,0.25)" }} />
            {/* Gold star decoration */}
            <div className="absolute top-3 end-4 opacity-20">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                <path d="M12 2 L14 9 L21 12 L14 15 L12 22 L10 15 L3 12 L10 9Z" fill="#C9A84C"/>
              </svg>
            </div>
            <p className="relative text-xs" style={{ color: "rgba(201,168,76,0.7)" }}>مجموعتي</p>
            <h2 className="relative mt-0.5 text-base font-bold">{(firstGroup as { name?: string }).name ?? ""}</h2>
            <Button
              size="sm"
              className="relative mt-4 rounded-full border-0 font-semibold"
              style={{ background: "linear-gradient(135deg, #C9A84C, #F5D98A)", color: "#1B2A4A" }}
              asChild
            >
              <Link href="/student/group">فتح المجموعة</Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "حضور هذا الشهر", value: rankData?.presentCount ?? "—", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20", href: "/student/group" },
            { label: "أيام الغياب",    value: rankData?.absentCount  ?? "—", icon: XCircle,       color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20", href: "/student/group" },
            { label: "نقاطي",          value: rankData?.score        ?? "—", icon: Trophy,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20", href: "/student/group" },
            { label: "ترتيبي",         value: rankData ? `#${rankData.rank}` : "—", icon: Trophy, color: "text-teal-600",   bg: "bg-teal-50 dark:bg-teal-900/20", href: "/student/group" },
          ].map((s) => {
            const CardContent = (
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md h-full">
                <div className={`mb-2 inline-grid size-8 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon className="size-4" />
                </div>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
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

        {/* Recent posts — with likes and comments */}
        {posts.length > 0 && firstGroup && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">آخر منشورات المجموعة</h2>
              <Link href="/student/group" className="flex items-center gap-1 text-xs text-primary hover:underline">
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
