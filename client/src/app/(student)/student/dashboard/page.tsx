import { TopBar }      from "@/shared/components/layout/topbar"
import { Button }      from "@/shared/components/ui/button"
import { serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiPost, ApiUser, resolveId } from "@/shared/types/api"
import { ArrowLeft, CalendarCheck, Heart, MessageCircle, Trophy, XCircle } from "lucide-react"
import Link from "next/link"

interface RankEntry {
  rank: number; score: number
  presentCount: number; absentCount: number; totalMembers: number
}

interface StudentDashboardData {
  student:       ApiUser
  groups:        ApiGroup[]
  notifications: { isRead: boolean }[]
  unreadCount:   number
  firstGroup:    (ApiGroup & { _id?: string; id?: string }) | null
  posts:         ApiPost[]
  rank:          RankEntry | null
}

export default async function StudentDashboard() {
  const session = await getSessionData()

  // Single request — all dashboard data
  let data: StudentDashboardData | null = null
  try {
    data = await serverFetch<StudentDashboardData>("/api/students/me/dashboard", {
      revalidate: 60,
      tags: ["student-dashboard"],
    })
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
        {/* Group banner */}
        {firstGroup && (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-700 p-5 text-white shadow-lg shadow-violet-500/20">
            <p className="text-xs text-violet-200">مجموعتي</p>
            <h2 className="mt-0.5 text-base font-bold">{(firstGroup as { name?: string }).name ?? ""}</h2>
            <Button size="sm" className="mt-4 bg-white text-violet-700 hover:bg-white/90" asChild>
              <Link href="/student/group">فتح المجموعة</Link>
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "حضور هذا الشهر", value: rankData?.presentCount ?? "—", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "أيام الغياب",    value: rankData?.absentCount  ?? "—", icon: XCircle,       color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-900/20"       },
            { label: "نقاطي",          value: rankData?.score        ?? "—", icon: Trophy,        color: "text-amber-600",   bg: "bg-amber-50 dark:bg-amber-900/20"     },
            { label: "ترتيبي",         value: rankData ? `#${rankData.rank}` : "—", icon: Trophy, color: "text-violet-600",  bg: "bg-violet-50 dark:bg-violet-900/20"   },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className={`mb-2 inline-grid size-8 place-items-center rounded-xl ${s.bg} ${s.color}`}>
                <s.icon className="size-4" />
              </div>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent posts */}
        {posts.length > 0 && (
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">آخر منشورات المجموعة</h2>
              <Link href="/student/group" className="flex items-center gap-1 text-xs text-primary hover:underline">
                عرض الكل <ArrowLeft className="size-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {posts.map((p) => {
                const pid    = resolveId(p)
                const author = p.author as { name?: string } | undefined
                return (
                  <article key={pid || p.createdAt} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                        {author?.name?.[0] ?? "م"}
                      </span>
                      <div>
                        <p className="text-xs font-semibold">{author?.name ?? "المدرس"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-3">{p.content}</p>
                    <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="size-3" />{p.likeCount ?? 0}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="size-3" />{p.commentCount ?? 0}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
