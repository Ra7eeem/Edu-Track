"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { useGroupPosts } from "@/features/teacher/hooks/use-group-posts"
import { useGroupRanking } from "@/features/teacher/hooks/use-group-ranking"
import { useStudentGroups } from "@/features/student/hooks/use-student"
import { toggleLikeAction } from "@/features/teacher/actions/post.action"
import { useNotifications } from "@/features/groups/hooks/use-notifications"
import { cn } from "@/shared/lib/tailwind-cn"
import { resolveId, GRADE_LABELS, Grade, type ApiPost, type ApiRankingEntry } from "@/shared/types/api"
import { Heart, MessageCircle } from "lucide-react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"
import { BookOpen } from "lucide-react"

const TABS = [
  { key: "posts",   label: "المنشورات" },
  { key: "ranking", label: "الترتيب"   },
  { key: "members", label: "الأعضاء"   },
]
const MEDALS = ["🥇", "🥈", "🥉"]

export default function StudentGroupPage() {
  const [tab,     setTab]           = useState("posts")
  const [pending, startTransition]  = useTransition()

  // notifications unread count
  const { data: notifsData } = useNotifications()
  const unread = (notifsData as { data?: { isRead?: boolean }[] } | undefined)?.data?.filter(n => !n.isRead).length ?? 0

  // student groups — handle both PaginatedResponse and plain array
  const { data: groupsRaw, isLoading: gLoading } = useStudentGroups()
  const groups = (() => {
    if (!groupsRaw) return []
    if (Array.isArray(groupsRaw)) return groupsRaw
    if (typeof groupsRaw === "object" && "data" in groupsRaw) {
      return (groupsRaw as { data: { _id?: string; id?: string; name?: string; description?: string | null }[] }).data
    }
    return []
  })() as { _id?: string; id?: string; name?: string; description?: string | null }[]

  const firstGroup = groups[0] ?? null
  // resolve MongoDB _id OR normalized id
  const groupId = firstGroup ? (resolveId(firstGroup as { _id?: string; id?: string }) || "") : ""

  const now = new Date()
  const { data: postsData,   isLoading: pLoading } = useGroupPosts(groupId)
  const { data: rankingData, isLoading: rLoading } = useGroupRanking(groupId, now.getMonth() + 1, now.getFullYear())

  // normalise posts — API may return { data: [...] } or plain array
  const posts = (() => {
    const raw = postsData as unknown
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiPost[]
    if (typeof raw === "object" && raw !== null && "data" in raw) {
      return (raw as { data: ApiPost[] }).data ?? []
    }
    return []
  })()

  // normalise ranking
  const ranking: ApiRankingEntry[] = (() => {
    const raw = rankingData as unknown
    if (!raw) return []
    if (typeof raw === "object" && raw !== null && "ranking" in raw) {
      return (raw as { ranking: ApiRankingEntry[] }).ranking ?? []
    }
    if (Array.isArray(raw)) return raw as ApiRankingEntry[]
    return []
  })()

  const handleLike = (postId: string) => {
    if (!groupId) return
    startTransition(async () => { await toggleLikeAction(groupId, postId) })
  }

  // No group yet
  if (!gLoading && !firstGroup) {
    return (
      <div className="flex flex-col">
        <TopBar
          title="مجموعتي"
          notifHref="/student/notifications"
          unreadCount={unread}
          userName="" userAvatar="أ" userAvatarColor="bg-cyan-500"
          profileHref="/student/profile"
        />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium">لم تنضم إلى مجموعة بعد</p>
          <p className="mt-1 text-sm text-muted-foreground">سجّل في مجموعة وانتظر موافقة المدرس</p>
          <Button className="mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white" asChild>
            <Link href="/register">الانضمام لمجموعة</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title={(firstGroup?.name as string | undefined) ?? "مجموعتي"}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName="" userAvatar="أ" userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl flex gap-1 px-4 py-2 sm:px-6 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all",
                tab === t.key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">

        {/* ── Posts ── */}
        {tab === "posts" && (
          <div className="space-y-4">
            {pLoading && (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-border/60 bg-muted" />
              ))
            )}
            {!pLoading && posts.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm text-muted-foreground">لا توجد منشورات بعد</p>
              </div>
            )}
            {posts.map(p => {
              const pid    = resolveId(p)
              const author = p.author as { name?: string } | undefined
              return (
                <article key={pid} className="rounded-2xl border border-border/60 bg-card shadow-sm">
                  <div className="flex items-center gap-3 px-4 pt-4">
                    <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                      {author?.name?.[0] ?? "م"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{author?.name ?? "المدرس"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <p className="px-4 pt-3 pb-4 text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                  <div className="flex items-center gap-4 border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
                    <button
                      onClick={() => handleLike(pid)}
                      disabled={pending}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Heart className={cn("size-3.5", p.isLiked && "fill-primary text-primary")} />
                      {p.likeCount ?? 0} إعجاب
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="size-3.5" />{p.commentCount ?? 0} تعليق
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* ── Ranking ── */}
        {tab === "ranking" && (
          <div className="space-y-2">
            {rLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl border border-border/60 bg-muted" />
              ))
            )}
            {!rLoading && ranking.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-sm text-muted-foreground">لا يوجد ترتيب بعد</p>
              </div>
            )}
            {ranking.length > 0 && (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  ترتيب {now.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
                </p>
                {ranking.map((entry: ApiRankingEntry) => {
                  const sid = resolveId(entry.student)
                  return (
                    <div
                      key={sid}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                        entry.rank <= 3
                          ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30"
                          : "border-border/60 bg-card"
                      )}
                    >
                      <span className="w-7 text-center shrink-0 text-sm font-bold">
                        {entry.rank <= 3 ? MEDALS[entry.rank - 1] : `#${entry.rank}`}
                      </span>
                      <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                        {entry.student.name[0]}
                      </span>
                      <span className="flex-1 truncate text-sm">{entry.student.name}</span>
                      <span className="text-sm font-bold text-primary shrink-0">{entry.score} نقطة</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── Members ── */}
        {tab === "members" && (
          <div className="space-y-2">
            {rLoading && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl border border-border/60 bg-muted" />
              ))
            )}
            {!rLoading && (
              <>
                <p className="mb-3 text-xs text-muted-foreground">{ranking.length} عضو</p>
                {ranking.length === 0 && (
                  <div className="flex flex-col items-center py-16 text-center">
                    <p className="text-3xl mb-2">👥</p>
                    <p className="text-sm text-muted-foreground">لا يوجد أعضاء بعد</p>
                  </div>
                )}
                {ranking.map((entry: ApiRankingEntry) => {
                  const sid = resolveId(entry.student)
                  return (
                    <div key={sid} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                        {entry.student.name[0]}
                      </span>
                      <span className="flex-1 text-sm truncate">{entry.student.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{entry.score} نقطة</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
