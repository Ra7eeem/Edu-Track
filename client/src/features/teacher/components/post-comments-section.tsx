"use client"

import { Button }      from "@/shared/components/ui/button"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiComment, ApiPost, resolveId } from "@/shared/types/api"
import { cn }           from "@/shared/lib/tailwind-cn"
import { MessageCircle, Send, Trash2 } from "lucide-react"
import { useState, useTransition } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface Props {
  groupId: string
  post:    ApiPost
}

function useComments(groupId: string, postId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["groups", groupId, "posts", postId, "comments"],
    queryFn:  () =>
      clientFetch<{ data: ApiComment[] }>(
        `/api/groups/${groupId}/posts/${postId}/comments?limit=100`
      ),
    enabled:   enabled && !!groupId && !!postId,
    staleTime: 30_000,
  })
}

export function PostCommentsSection({ groupId, post }: Props) {
  const pid = resolveId(post)
  const qc  = useQueryClient()

  const [open,         setOpen]         = useState(false)
  const [commentText,  setCommentText]  = useState("")
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isPending,    startTransition] = useTransition()

  const { data: raw, isLoading } = useComments(groupId, pid, open)
  const comments: ApiComment[] = (() => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiComment[]
    if (typeof raw === "object" && "data" in raw) return (raw as { data: ApiComment[] }).data ?? []
    return []
  })()

  // ── Delete mutation ──────────────────────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: (commentId: string) =>
      clientFetch<void>(
        `/api/groups/${groupId}/posts/${pid}/comments/${commentId}`,
        { method: "DELETE" } as never
      ),
    onSuccess: (_, commentId) => {
      qc.setQueryData(["groups", groupId, "posts", pid, "comments"], (old: unknown) => {
        if (!old) return old
        const upd = (arr: ApiComment[]) => arr.filter(c => resolveId(c) !== commentId)
        if (Array.isArray(old)) return upd(old as ApiComment[])
        if (typeof old === "object" && old !== null && "data" in old) {
          const o = old as { data: ApiComment[] }
          return { ...o, data: upd(o.data) }
        }
        return old
      })
      // Decrement post commentCount
      qc.setQueryData(["groups", groupId, "posts"], (old: unknown) => {
        const upd = (p: ApiPost) =>
          resolveId(p) === pid ? { ...p, commentCount: Math.max(0, (p.commentCount ?? 1) - 1) } : p
        if (!old) return old
        if (Array.isArray(old)) return (old as ApiPost[]).map(upd)
        if (typeof old === "object" && old !== null && "data" in old) {
          const o = old as { data: ApiPost[] }
          return { ...o, data: o.data.map(upd) }
        }
        return old
      })
      setDeleteTarget(null)
    },
  })

  // ── Create comment mutation ──────────────────────────────────────────────────
  const createMut = useMutation({
    mutationFn: (content: string) =>
      clientFetch<ApiComment>(
        `/api/groups/${groupId}/posts/${pid}/comments`,
        { method: "POST", data: { content } } as never
      ),
    onSuccess: newComment => {
      // Append to comments cache
      qc.setQueryData(["groups", groupId, "posts", pid, "comments"], (old: unknown) => {
        if (!old) return { data: [newComment] }
        if (Array.isArray(old)) return [...(old as ApiComment[]), newComment]
        if (typeof old === "object" && old !== null && "data" in old) {
          const o = old as { data: ApiComment[] }
          return { ...o, data: [...o.data, newComment] }
        }
        return old
      })
      // Increment commentCount on post
      qc.setQueryData(["groups", groupId, "posts"], (old: unknown) => {
        const upd = (p: ApiPost) =>
          resolveId(p) === pid ? { ...p, commentCount: (p.commentCount ?? 0) + 1 } : p
        if (!old) return old
        if (Array.isArray(old)) return (old as ApiPost[]).map(upd)
        if (typeof old === "object" && old !== null && "data" in old) {
          const o = old as { data: ApiPost[] }
          return { ...o, data: o.data.map(upd) }
        }
        return old
      })
      setCommentText("")
    },
  })

  const handleDelete = (commentId: string) => {
    setDeleteTarget(commentId)
    startTransition(() => { deleteMut.mutate(commentId) })
  }

  const handleComment = () => {
    if (!commentText.trim()) return
    createMut.mutate(commentText.trim())
  }

  return (
    <div className="border-t border-border/40">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="size-3.5" />
        <span>{post.commentCount ?? 0} تعليق</span>
        <span className="ms-auto text-[10px] text-primary">
          {open ? "إخفاء" : "عرض التعليقات"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Compose */}
          <div className="flex items-end gap-2">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="أضف تعليقاً..."
              rows={2}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment() } }}
              className="flex-1 resize-none rounded-2xl border border-input bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={handleComment}
              disabled={createMut.isPending || !commentText.trim()}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
              aria-label="إرسال التعليق"
            >
              <Send className="size-4" />
            </button>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="py-3 text-center text-xs text-muted-foreground">لا توجد تعليقات</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.map(c => {
                const cid        = resolveId(c)
                const author     = c.author as { name?: string; role?: string } | undefined
                const isDeleting = deleteTarget === cid && isPending
                return (
                  <div key={cid}
                    className={cn(
                      "flex items-start gap-2.5 rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 transition-opacity",
                      isDeleting && "opacity-40"
                    )}>
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                      {(author?.name ?? "؟")[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold">{author?.name ?? "مجهول"}</span>
                        {author?.role === "TEACHER" && (
                          <span className="rounded-full bg-violet-100 px-1.5 py-px text-[9px] font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                            مدرس
                          </span>
                        )}
                        {author?.role === "ADMIN" && (
                          <span className="rounded-full bg-rose-100 px-1.5 py-px text-[9px] font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                            مدير
                          </span>
                        )}
                        <span className="ms-auto text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed">{c.content}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(cid)}
                      disabled={isDeleting}
                      className="grid size-6 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 transition-colors disabled:opacity-40 dark:hover:bg-rose-950/20"
                      aria-label="حذف التعليق"
                    >
                      <Trash2 className="size-3" />
                    </button>
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
