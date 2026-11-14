"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { useGroupPosts } from "@/features/teacher/hooks/use-group-posts"
import { useGroupRanking } from "@/features/teacher/hooks/use-group-ranking"
import { useStudentGroups, useStudentMe } from "@/features/student/hooks/use-student"
import { usePostComments } from "@/features/student/hooks/use-post-comments"
import {
  studentCreateCommentAction,
  studentDeleteCommentAction,
  studentToggleLikeAction,
} from "@/features/student/actions/post.action"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/tailwind-cn"
import { clientFetch } from "@/shared/lib/api-client"
import {
  resolveId,
  GRADE_LABELS,
  Grade,
  type ApiPost,
  type ApiRankingEntry,
  type ApiComment,
  type ApiUser,
  type ApiGroup,
  type PaginatedResponse,
} from "@/shared/types/api"
import {
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Trash2,
  CornerDownRight,
  ChevronRight,
} from "lucide-react"
import { useState, useTransition } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

const TABS = [
  { key: "posts", label: "المنشورات" },
  { key: "ranking", label: "الترتيب" },
  { key: "members", label: "الأعضاء" },
]
const MEDALS = ["🥇", "🥈", "🥉"]

// ─── Comment Section for a single post ────────────────────────────────────────
function CommentsSection({
  groupId,
  post,
  currentUserId,
}: {
  groupId: string
  post: ApiPost
  currentUserId: string
}) {
  const pid = resolveId(post)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [submitting, startTransition] = useTransition()
  const qc = useQueryClient()

  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ cid: string; name: string } | null>(null)
  const [replyText, setReplyText] = useState("")
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({})
  const [localReplies, setLocalReplies] = useState<Record<string, ApiComment[]>>({})

  const { data: commentsData, isLoading } = usePostComments(groupId, pid, open)
  const comments: ApiComment[] = (() => {
    const raw = commentsData as unknown
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiComment[]
    if (typeof raw === "object" && raw !== null && "data" in raw)
      return (raw as { data: ApiComment[] }).data ?? []
    return []
  })()

  const likeMut = useMutation({
    mutationFn: () => studentToggleLikeAction(groupId, pid),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ["groups", groupId, "posts"] })
      const prev = qc.getQueryData(["groups", groupId, "posts"])
      qc.setQueryData(["groups", groupId, "posts"], (old: unknown) => {
        const updatePost = (p: ApiPost) => {
          if (resolveId(p) !== pid) return p
          return {
            ...p,
            isLiked: !p.isLiked,
            likeCount: p.isLiked ? (p.likeCount ?? 1) - 1 : (p.likeCount ?? 0) + 1,
          }
        }
        if (!old) return old
        if (Array.isArray(old)) return (old as ApiPost[]).map(updatePost)
        if (typeof old === "object" && old !== null && "data" in old) {
          const o = old as { data: ApiPost[] }
          return { ...o, data: o.data.map(updatePost) }
        }
        return old
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["groups", groupId, "posts"], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["groups", groupId, "posts"] }),
  })

  // helper: increment/decrement post commentCount
  const patchPostCount = (delta: number) => {
    qc.setQueryData(["groups", groupId, "posts"], (old: unknown) => {
      const update = (p: ApiPost) =>
        resolveId(p) === pid
          ? { ...p, commentCount: Math.max(0, (p.commentCount ?? 0) + delta) }
          : p
      if (!old) return old
      if (Array.isArray(old)) return (old as ApiPost[]).map(update)
      if (typeof old === "object" && old !== null && "data" in old) {
        const o = old as { data: ApiPost[] }
        return { ...o, data: o.data.map(update) }
      }
      return old
    })
  }

  const handleComment = () => {
    if (!text.trim()) return
    startTransition(async () => {
      const res = await studentCreateCommentAction(groupId, pid, text.trim())
      if (res.success) {
        setText("")
        patchPostCount(+1)
        qc.invalidateQueries({ queryKey: ["groups", groupId, "posts", pid, "comments"] })
      }
    })
  }

  const handleReply = (cid: string) => {
    if (!replyText.trim()) return
    startTransition(async () => {
      const res = await studentCreateCommentAction(groupId, pid, replyText.trim(), cid)
      if (res.success) {
        setReplyText("")
        setReplyingTo(null)
        patchPostCount(+1)
        // Refresh replies for this comment using native fetch
        const replyRes = (await clientFetch<{ data: ApiComment[] }>(
          `/api/groups/${groupId}/posts/${pid}/comments/${cid}/replies?limit=50`
        )) as { data: ApiComment[] }
        setLocalReplies((prev) => ({
          ...prev,
          [cid]: Array.isArray(replyRes) ? replyRes : replyRes.data ?? [],
        }))
        setOpenReplies((prev) => ({ ...prev, [cid]: true }))
      }
    })
  }

  const handleLoadReplies = async (cid: string) => {
    const isOpen = openReplies[cid]
    if (isOpen) {
      setOpenReplies((prev) => ({ ...prev, [cid]: false }))
      return
    }
    if (!localReplies[cid]) {
      const res = (await clientFetch<{ data: ApiComment[] }>(
        `/api/groups/${groupId}/posts/${pid}/comments/${cid}/replies?limit=50`
      )) as { data: ApiComment[] }
      setLocalReplies((prev) => ({
        ...prev,
        [cid]: Array.isArray(res) ? res : res.data ?? [],
      }))
    }
    setOpenReplies((prev) => ({ ...prev, [cid]: true }))
  }

  return (
    <div className="border-t border-border/40">
      {/* Like + Comment count bar */}
      <div className="flex items-center gap-4 px-4 py-3 text-xs text-muted-foreground">
        <button
          onClick={() => likeMut.mutate()}
          disabled={likeMut.isPending}
          className={cn(
            "flex items-center gap-1.5 transition-colors",
            post.isLiked ? "text-primary" : "hover:text-primary"
          )}
        >
          <Heart
            className={cn(
              "size-3.5 transition-all",
              post.isLiked && "fill-primary text-primary"
            )}
          />
          {post.likeCount ?? 0} إعجاب
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 hover:text-primary transition-colors"
        >
          <MessageCircle className="size-3.5" />
          {post.commentCount ?? 0} تعليق
          {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
        </button>
      </div>

      {/* Comments panel */}
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Write comment */}
          <div className="flex gap-2 items-end">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب تعليقاً..."
              rows={2}
              className="flex-1 rounded-2xl border border-input bg-muted/40 px-3 py-2 text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleComment()
                }
              }}
            />
            <button
              onClick={handleComment}
              disabled={submitting || !text.trim()}
              className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
            >
              <Send className="size-4" />
            </button>
          </div>

          {/* Comments list */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              لا توجد تعليقات بعد — كن أول من يعلق!
            </p>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pe-1">
              {comments.map((c) => {
                const cid = resolveId(c as { _id?: string; id?: string })
                const author = c.author as
                  | { name?: string; _id?: string; id?: string }
                  | undefined
                const authorId = author?._id ?? author?.id ?? ""
                const isOwn = !!currentUserId && authorId === currentUserId
                const replyCount = c.replyCount ?? 0
                return (
                  <div key={cid} className="space-y-1.5">
                    {/* Comment row */}
                    <div className="flex gap-2.5">
                      <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 mt-0.5">
                        {(author?.name ?? "م")[0]}
                      </span>
                      <div className="min-w-0 flex-1 rounded-2xl bg-muted/60 px-3 py-2">
                        <p className="text-xs font-semibold">{author?.name ?? "مستخدم"}</p>
                        <p className="text-sm leading-relaxed">{c.content}</p>
                      </div>
                      {isOwn && (
                        <button
                          onClick={() => {
                            startTransition(async () => {
                              await studentDeleteCommentAction(groupId, pid, cid)
                              qc.setQueryData(
                                ["groups", groupId, "posts", pid, "comments"],
                                (old: unknown) => {
                                  if (!old) return old
                                  const upd = (arr: ApiComment[]) =>
                                    arr.filter(
                                      (x) =>
                                        resolveId(x as { _id?: string; id?: string }) !== cid
                                    )
                                  if (Array.isArray(old)) return upd(old as ApiComment[])
                                  if (
                                    typeof old === "object" &&
                                    old !== null &&
                                    "data" in old
                                  ) {
                                    const o = old as { data: ApiComment[] }
                                    return { ...o, data: upd(o.data) }
                                  }
                                  return old
                                }
                              )
                              patchPostCount(-1)
                            })
                          }}
                          className="mt-1 grid size-6 shrink-0 place-items-center self-start rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors dark:hover:bg-rose-950/20"
                          aria-label="حذف تعليقي"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>

                    {/* Reply / View replies row */}
                    <div className="ms-9 flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (replyingTo?.cid === cid) {
                            setReplyingTo(null)
                            setReplyText("")
                          } else {
                            setReplyingTo({ cid, name: author?.name ?? "مستخدم" })
                            setReplyText("")
                          }
                        }}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        <CornerDownRight className="size-3" />
                        رد
                      </button>
                      {replyCount > 0 && (
                        <button
                          onClick={() => handleLoadReplies(cid)}
                          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          {openReplies[cid] ? (
                            <ChevronDown className="size-3" />
                          ) : (
                            <ChevronRight className="size-3" />
                          )}
                          {replyCount} {replyCount === 1 ? "رد" : "ردود"}
                        </button>
                      )}
                    </div>

                    {/* Inline reply input */}
                    {replyingTo?.cid === cid && (
                      <div className="ms-9 flex items-end gap-2 animate-fade-in">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`رد على ${replyingTo.name}...`}
                          rows={1}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault()
                              handleReply(cid)
                            }
                          }}
                          className="flex-1 resize-none rounded-xl border border-input bg-muted/40 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <button
                          onClick={() => handleReply(cid)}
                          disabled={submitting || !replyText.trim()}
                          className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                        >
                          <Send className="size-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Replies list */}
                    {openReplies[cid] && localReplies[cid] && (
                      <div className="ms-9 space-y-1.5">
                        {localReplies[cid].map((r) => {
                          const rid = resolveId(r as { _id?: string; id?: string })
                          const rAuthor = r.author as
                            | { name?: string; _id?: string; id?: string }
                            | undefined
                          return (
                            <div key={rid} className="flex items-start gap-2">
                              <CornerDownRight className="size-3 shrink-0 mt-1.5 text-muted-foreground/40" />
                              <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-teal-100 text-[9px] font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                                {(rAuthor?.name ?? "م")[0]}
                              </span>
                              <div className="flex-1 rounded-xl bg-muted/40 px-3 py-2">
                                <p className="text-xs font-semibold">{rAuthor?.name ?? "مستخدم"}</p>
                                <p className="text-xs leading-relaxed">{r.content}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Student Group Client ─────────────────────────────────────────────────────
interface StudentGroupClientProps {
  initialUser?: ApiUser | null
  initialGroups?: PaginatedResponse<ApiGroup> | ApiGroup[] | null
  initialPosts?: PaginatedResponse<ApiPost> | ApiPost[] | null
  unreadCount?: number
}

export function StudentGroupClient({
  initialUser,
  initialGroups,
  initialPosts,
  unreadCount = 0,
}: StudentGroupClientProps) {
  const [activeTab, setActiveTab] = useState("posts")

  const { data: me } = useStudentMe({ initialData: initialUser ?? undefined })
  const currentUserId = me?._id ?? me?.id ?? ""

  const { data: groupsRaw, isLoading: gLoading } = useStudentGroups({
    initialData: initialGroups ?? undefined,
  })

  const groups = (() => {
    if (!groupsRaw) return []
    if (Array.isArray(groupsRaw)) return groupsRaw
    if (typeof groupsRaw === "object" && "data" in groupsRaw)
      return (
        groupsRaw as {
          data: {
            _id?: string
            id?: string
            name?: string
            description?: string | null
          }[]
        }
      ).data
    return []
  })() as {
    _id?: string
    id?: string
    name?: string
    description?: string | null
    grades?: string[]
  }[]

  const firstGroup = groups[0] ?? null
  const groupId = firstGroup ? resolveId(firstGroup as { _id?: string; id?: string }) || "" : ""

  const now = new Date()
  const { data: postsData, isLoading: pLoading } = useGroupPosts(groupId, {
    initialData: initialPosts ?? undefined,
  })
  const { data: rankingData, isLoading: rLoading } = useGroupRanking(
    groupId,
    now.getMonth() + 1,
    now.getFullYear()
  )

  const posts: ApiPost[] = (() => {
    const raw = postsData as unknown
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiPost[]
    if (typeof raw === "object" && raw !== null && "data" in raw)
      return (raw as { data: ApiPost[] }).data ?? []
    return []
  })()

  const ranking: ApiRankingEntry[] = (() => {
    const raw = rankingData as unknown
    if (!raw) return []
    if (typeof raw === "object" && raw !== null && "ranking" in raw)
      return (raw as { ranking: ApiRankingEntry[] }).ranking ?? []
    if (Array.isArray(raw)) return raw as ApiRankingEntry[]
    return []
  })()

  const userName = me?.name ?? ""
  const userAvatar = (userName[0] ?? "أ")

  if (!gLoading && !firstGroup) {
    return (
      <div className="flex flex-col">
        <TopBar
          title="مجموعتي"
          notifHref="/student/notifications"
          unreadCount={unreadCount}
          userName={userName}
          userAvatar={userAvatar}
          userAvatarColor="bg-cyan-500"
          profileHref="/student/profile"
        />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium">لم تنضم إلى مجموعة بعد</p>
          <p className="mt-1 text-sm text-muted-foreground">
            سجّل في مجموعة وانتظر موافقة المدرس
          </p>
          <Button
            className="mt-4 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white"
            asChild
          >
            <Link href="/register">الانضمام لمجموعة</Link>
          </Button>
        </div>
      </div>
    )
  }

  const groupName = firstGroup?.name as string | undefined
  const gradesArr = (firstGroup?.grades ?? []) as string[]

  return (
    <div className="flex flex-col">
      <TopBar
        title={groupName ?? "مجموعتي"}
        notifHref="/student/notifications"
        unreadCount={unreadCount}
        userName={userName}
        userAvatar={userAvatar}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      {/* Grades strip */}
      {gradesArr.length > 0 && (
        <div className="flex gap-1.5 px-4 py-2 border-b border-border/40 bg-card overflow-x-auto">
          {gradesArr.map((g) => (
            <span
              key={g}
              className="shrink-0 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
            >
              {GRADE_LABELS[g as Grade] ?? g}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl flex gap-1 px-4 py-2 sm:px-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition-all",
                activeTab === t.key
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
        {activeTab === "posts" && (
          <div className="space-y-4">
            {pLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-2xl border border-border/60 bg-muted"
                />
              ))}
            {!pLoading && posts.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-sm text-muted-foreground">لا توجد منشورات بعد</p>
              </div>
            )}
            {posts.map((p) => {
              const pid = resolveId(p)
              const author = p.author as { name?: string } | undefined
              return (
                <article
                  key={pid}
                  className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                      {author?.name?.[0] ?? "م"}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{author?.name ?? "المدرس"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <p className="px-4 pb-3 text-sm leading-relaxed whitespace-pre-line">
                    {p.content}
                  </p>
                  <CommentsSection groupId={groupId} post={p} currentUserId={currentUserId} />
                </article>
              )
            })}
          </div>
        )}

        {/* ── Ranking ── */}
        {activeTab === "ranking" && (
          <div className="space-y-2">
            {rLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl border border-border/60 bg-muted"
                />
              ))}
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
                      <span className="text-sm font-bold text-primary shrink-0">
                        {entry.score} نقطة
                      </span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── Members ── */}
        {activeTab === "members" && (
          <div className="space-y-2">
            {rLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-2xl border border-border/60 bg-muted"
                />
              ))}
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
                    <div
                      key={sid}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3"
                    >
                      <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                        {entry.student.name[0]}
                      </span>
                      <span className="flex-1 text-sm truncate">{entry.student.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {entry.score} نقطة
                      </span>
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

