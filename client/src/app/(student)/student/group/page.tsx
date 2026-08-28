"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { useGroupPosts } from "@/features/teacher/hooks/use-group-posts"
import { useGroupRanking } from "@/features/teacher/hooks/use-group-ranking"
import { useStudentGroups } from "@/features/student/hooks/use-student"
import { toggleLikeAction } from "@/features/teacher/actions/post.action"
import { cn } from "@/shared/lib/tailwind-cn"
import { resolveId } from "@/shared/types/api"
import { Heart, MessageCircle, Users } from "lucide-react"
import { useState, useTransition } from "react"
import { useNotifications } from "@/features/groups/hooks/use-notifications"

const TABS = [
  { key: "posts",    label: "المنشورات" },
  { key: "ranking",  label: "الترتيب"  },
  { key: "students", label: "الأعضاء"  },
]

export default function StudentGroupPage() {
  const [tab,      setTab]    = useState("posts")
  const [pending,  startTransition] = useTransition()

  const { data: notifsData } = useNotifications()
  const unread = (notifsData?.data ?? []).filter(n => !n.isRead).length

  const { data: groupsData } = useStudentGroups()
  const firstGroup = groupsData?.data?.[0]
  const groupId    = firstGroup?.id ?? ""

  const now = new Date()
  const { data: postsData    } = useGroupPosts(groupId)
  const { data: rankingData  } = useGroupRanking(groupId, now.getMonth() + 1, now.getFullYear())

  const posts   = postsData?.data   ?? []
  const ranking = rankingData?.ranking ?? []

  const handleLike = (postId: string) => {
    if (!groupId) return
    startTransition(async () => { await toggleLikeAction(groupId, postId) })
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title={firstGroup?.name ?? "مجموعتي"}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName=""
        userAvatar="أ"
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl flex gap-1 px-4 py-2 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-medium transition-all",
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
        {/* Posts */}
        {tab === "posts" && (
          <div className="space-y-4">
            {posts.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm text-muted-foreground">لا توجد منشورات بعد</p>
              </div>
            )}
            {posts.map((p) => {
              const author = (p.author as { name?: string } | undefined)
              return (
                <article key={p.id} className="rounded-2xl border border-border/60 bg-card shadow-sm">
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
                      onClick={() => handleLike(resolveId(p))}
                      disabled={pending}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                    >
                      <Heart className={cn("size-3.5", p.isLiked && "fill-primary text-primary")} />
                      {p.likeCount} إعجاب
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="size-3.5" />{p.commentCount} تعليق
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Ranking */}
        {tab === "ranking" && (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">
              ترتيب {now.toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
            </p>
            {ranking.map((entry) => (
              <div
                key={entry.student.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                  entry.rank <= 3
                    ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30"
                    : "border-border/60 bg-card"
                )}
              >
                <span className="w-6 text-center shrink-0 text-sm">
                  {entry.rank <= 3 ? ["🥇","🥈","🥉"][entry.rank-1] : `#${entry.rank}`}
                </span>
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                  {entry.student.name[0]}
                </span>
                <span className="flex-1 truncate text-sm">{entry.student.name}</span>
                <span className="text-sm font-bold text-primary shrink-0">{entry.score}</span>
              </div>
            ))}
          </div>
        )}

        {/* Students tab — reuse ranking list as member list */}
        {tab === "students" && (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">{ranking.length} عضو</p>
            {ranking.map((entry) => (
              <div key={entry.student.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                  {entry.student.name[0]}
                </span>
                <span className="flex-1 text-sm">{entry.student.name}</span>
                <span className="text-xs text-muted-foreground">{entry.score} نقطة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
