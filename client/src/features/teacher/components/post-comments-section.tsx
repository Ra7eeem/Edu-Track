"use client"

import { clientFetch }  from "@/shared/lib/api-client"
import { ApiComment, ApiPost, resolveId } from "@/shared/types/api"
import { cn }            from "@/shared/lib/tailwind-cn"
import { ChevronDown, ChevronRight, CornerDownRight, MessageCircle, Send, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/* ── types ─────────────────────────────────────────────────────────────────── */
interface Props {
  groupId:      string
  post:         ApiPost
  viewerRole?:  "TEACHER" | "ADMIN" | "STUDENT"
  /** current user's id — used to show delete on own replies */
  viewerId?:    string
}
type Author = { name?: string; role?: string; _id?: string; id?: string } | undefined

/* ── cache helpers ─────────────────────────────────────────────────────────── */
function patchPostCount(
  qc: ReturnType<typeof useQueryClient>,
  groupId: string, pid: string, delta: number
) {
  qc.setQueryData(["groups", groupId, "posts"], (old: unknown) => {
    const f = (p: ApiPost) =>
      resolveId(p) === pid ? { ...p, commentCount: Math.max(0, (p.commentCount ?? 0) + delta) } : p
    if (!old) return old
    if (Array.isArray(old)) return (old as ApiPost[]).map(f)
    if (typeof old === "object" && "data" in old) {
      const o = old as { data: ApiPost[] }; return { ...o, data: o.data.map(f) }
    }
    return old
  })
}

function patchCommentCache(
  qc: ReturnType<typeof useQueryClient>,
  key: unknown[], fn: (arr: ApiComment[]) => ApiComment[]
) {
  qc.setQueryData(key, (old: unknown) => {
    if (!old) return old
    if (Array.isArray(old)) return fn(old as ApiComment[])
    if (typeof old === "object" && "data" in old) {
      const o = old as { data: ApiComment[] }; return { ...o, data: fn(o.data) }
    }
    return old
  })
}

/* ── Role badge ────────────────────────────────────────────────────────────── */
function RoleBadge({ role }: { role?: string }) {
  if (role === "TEACHER")
    return <span className="rounded-full bg-teal-100 px-1.5 py-px text-[9px] font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">مدرس</span>
  if (role === "ADMIN")
    return <span className="rounded-full bg-rose-100 px-1.5 py-px text-[9px] font-bold text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">مدير</span>
  return null
}

/* ── Reply row ───────────────────────────────────────────────────────────────── */
function ReplyRow({
  reply, groupId, pid, commentId, parentName, canDelete, onDeleted,
}: {
  reply:       ApiComment
  groupId:     string
  pid:         string
  commentId:   string
  parentName:  string
  canDelete:   boolean
  onDeleted:   (rid: string) => void
}) {
  const rid    = resolveId(reply)
  const author = reply.author as Author
  const qc     = useQueryClient()

  const deleteMut = useMutation({
    mutationFn: () =>
      clientFetch<void>(`/api/groups/${groupId}/posts/${pid}/comments/${rid}`, { method: "DELETE" } as never),
    onSuccess: () => {
      onDeleted(rid)
      patchCommentCache(qc, ["groups", groupId, "posts", pid, "comments"], arr =>
        arr.map(c => resolveId(c) === commentId
          ? { ...c, replyCount: Math.max(0, (c.replyCount ?? 1) - 1) } : c))
      patchPostCount(qc, groupId, pid, -1)
    },
  })

  return (
    <div className="flex items-start gap-0 animate-fade-in">
      {/* Vertical thread line */}
      <div className="flex flex-col items-center me-2">
        <div className="w-px flex-1 min-h-[8px]"
          style={{ background: "linear-gradient(to bottom, oklch(0.46 0.13 183 / 0.3), oklch(0.67 0.15 70 / 0.2))" }} />
        <CornerDownRight className="size-3 shrink-0 text-primary/30 mb-1" />
      </div>

      {/* Avatar — gold tint to distinguish from parent */}
      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-amber-100 text-[9px] font-bold text-amber-700 dark:bg-amber-900/25 dark:text-amber-400 me-2">
        {(author?.name ?? "؟")[0]}
      </span>

      {/* Bubble — slightly different background from main comment */}
      <div className="min-w-0 flex-1 rounded-2xl rounded-ss-sm border border-amber-200/60 bg-amber-50/60 px-3 py-2 dark:border-amber-800/30 dark:bg-amber-950/20">
        {/* Reply-to mention */}
        <p className="mb-1 text-[9px] text-amber-600/80 dark:text-amber-400/70 font-medium">
          ↩ ردًّا على {parentName}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <span className="text-xs font-semibold">{author?.name ?? "مجهول"}</span>
          <RoleBadge role={author?.role} />
          <span className="ms-auto text-[10px] text-muted-foreground">
            {new Date(reply.createdAt).toLocaleDateString("ar-EG")}
          </span>
        </div>
        <p className="text-xs leading-relaxed">{reply.content}</p>
      </div>

      {canDelete && (
        <button
          onClick={() => deleteMut.mutate()}
          disabled={deleteMut.isPending}
          className="ms-1.5 mt-1 grid size-6 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 transition-colors disabled:opacity-40"
          aria-label="حذف الرد"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  )
}

/* ── Comment row ────────────────────────────────────────────────────────────── */
function CommentRow({
  comment, groupId, pid, canDeleteAll, viewerId, onDelete, onReplySuccess,
}: {
  comment:        ApiComment
  groupId:        string
  pid:            string
  canDeleteAll:   boolean
  viewerId?:      string
  onDelete:       (cid: string) => void
  onReplySuccess: () => void
}) {
  const cid    = resolveId(comment)
  const author = comment.author as Author
  const qc     = useQueryClient()

  const [showReply,     setShowReply]     = useState(false)
  const [replyText,     setReplyText]     = useState("")
  const [showReplies,   setShowReplies]   = useState(false)
  const [localReplies,  setLocalReplies]  = useState<ApiComment[]>([])
  const [repliesLoaded, setRepliesLoaded] = useState(false)
  const replyRef = useRef<HTMLTextAreaElement>(null)
  const replyCount = comment.replyCount ?? 0

  useEffect(() => { if (showReply) replyRef.current?.focus() }, [showReply])

  useQuery({
    queryKey: ["groups", groupId, "posts", pid, "comments", cid, "replies"],
    queryFn:  async () => {
      const res = await clientFetch<{ data: ApiComment[] }>(
        `/api/groups/${groupId}/posts/${pid}/comments/${cid}/replies?limit=50`
      )
      const arr = Array.isArray(res) ? res : (res as { data: ApiComment[] }).data ?? []
      setLocalReplies(arr); setRepliesLoaded(true)
      return arr
    },
    enabled:   showReplies && replyCount > 0 && !repliesLoaded,
    staleTime: 30_000,
  })

  const replyMut = useMutation({
    mutationFn: (content: string) =>
      clientFetch<ApiComment>(
        `/api/groups/${groupId}/posts/${pid}/comments`,
        { method: "POST", data: { content, parentCommentId: cid } } as never
      ),
    onSuccess: (r) => {
      setLocalReplies(p => [...p, r])
      setRepliesLoaded(true); setShowReplies(true)
      setReplyText(""); setShowReply(false)
      patchCommentCache(qc, ["groups", groupId, "posts", pid, "comments"], arr =>
        arr.map(c => resolveId(c) === cid ? { ...c, replyCount: (c.replyCount ?? 0) + 1 } : c))
      patchPostCount(qc, groupId, pid, +1)
      onReplySuccess()
    },
  })

  const parentName = author?.name ?? "مجهول"

  return (
    <div className="space-y-2">
      {/* ── Main comment ── */}
      <div className="flex items-start gap-2.5">
        {/* Avatar — teal for main comment */}
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-teal-100 text-[10px] font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          {(author?.name ?? "؟")[0]}
        </span>

        <div className="min-w-0 flex-1">
          {/* Bubble */}
          <div className="rounded-2xl rounded-ss-sm border border-border/40 bg-muted/40 px-3 py-2.5">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-xs font-semibold">{author?.name ?? "مجهول"}</span>
              <RoleBadge role={author?.role} />
              <span className="ms-auto text-[10px] text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString("ar-EG")}
              </span>
            </div>
            <p className="text-xs leading-relaxed">{comment.content}</p>
          </div>

          {/* Action row */}
          <div className="mt-1.5 flex items-center gap-3 px-1">
            <button
              onClick={() => setShowReply(v => !v)}
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium transition-colors",
                showReply ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <CornerDownRight className="size-3" />رد
            </button>
            {replyCount > 0 && (
              <button
                onClick={() => setShowReplies(v => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                {showReplies ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                {replyCount} {replyCount === 1 ? "رد" : "ردود"}
              </button>
            )}
          </div>
        </div>

        {canDeleteAll && (
          <button
            onClick={() => onDelete(cid)}
            className="mt-1 grid size-6 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/20 transition-colors"
            aria-label="حذف التعليق"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>

      {/* ── Reply input ── */}
      {showReply && (
        <div className="ms-9 flex items-end gap-2 animate-fade-in">
          <textarea
            ref={replyRef}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            placeholder={`ردًّا على ${parentName}...`}
            rows={1}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (replyText.trim()) replyMut.mutate(replyText.trim()) }
            }}
            className="flex-1 resize-none rounded-xl border border-input bg-muted/40 px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={() => { if (replyText.trim()) replyMut.mutate(replyText.trim()) }}
            disabled={replyMut.isPending || !replyText.trim()}
            className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
            aria-label="إرسال الرد"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      )}

      {/* ── Replies list ── */}
      {showReplies && localReplies.length > 0 && (
        <div className="ms-9 space-y-2">
          {localReplies.map(r => {
            const rAuthorId = (r.author as Author)?._id ?? (r.author as Author)?.id ?? ""
            const canDelReply = canDeleteAll || (!!viewerId && rAuthorId === viewerId)
            return (
              <ReplyRow
                key={resolveId(r)}
                reply={r}
                groupId={groupId}
                pid={pid}
                commentId={cid}
                parentName={parentName}
                canDelete={canDelReply}
                onDeleted={rid => setLocalReplies(prev => prev.filter(x => resolveId(x) !== rid))}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Main export ────────────────────────────────────────────────────────────── */
export function PostCommentsSection({ groupId, post, viewerRole = "TEACHER", viewerId }: Props) {
  const pid = resolveId(post)
  const qc  = useQueryClient()

  const [open,    setOpen]    = useState(false)
  const [newText, setNewText] = useState("")

  const { data: raw, isLoading } = useQuery({
    queryKey: ["groups", groupId, "posts", pid, "comments"],
    queryFn:  () => clientFetch<{ data: ApiComment[] }>(`/api/groups/${groupId}/posts/${pid}/comments?limit=100`),
    enabled:  open && !!groupId && !!pid,
    staleTime: 30_000,
  })

  const comments: ApiComment[] = (() => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiComment[]
    if (typeof raw === "object" && "data" in raw) return (raw as { data: ApiComment[] }).data ?? []
    return []
  })()

  const deleteMut = useMutation({
    mutationFn: (cid: string) =>
      clientFetch<void>(`/api/groups/${groupId}/posts/${pid}/comments/${cid}`, { method: "DELETE" } as never),
    onSuccess: (_, cid) => {
      patchCommentCache(qc, ["groups", groupId, "posts", pid, "comments"], arr => arr.filter(c => resolveId(c) !== cid))
      patchPostCount(qc, groupId, pid, -1)
    },
  })

  const createMut = useMutation({
    mutationFn: (content: string) =>
      clientFetch<ApiComment>(`/api/groups/${groupId}/posts/${pid}/comments`, { method: "POST", data: { content } } as never),
    onSuccess: newComment => {
      patchCommentCache(qc, ["groups", groupId, "posts", pid, "comments"], arr => [...arr, newComment])
      patchPostCount(qc, groupId, pid, +1)
      setNewText("")
    },
  })

  const canDeleteAll = viewerRole === "TEACHER" || viewerRole === "ADMIN"

  return (
    <div className="border-t border-border/40">
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageCircle className="size-3.5" />
        <span>{post.commentCount ?? 0} تعليق</span>
        <span className="ms-auto text-[10px] text-primary font-medium">
          {open ? "إخفاء ▲" : "عرض التعليقات ▼"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Compose box */}
          <div className="flex items-end gap-2">
            <textarea
              value={newText}
              onChange={e => setNewText(e.target.value)}
              placeholder="اكتب تعليقاً..."
              rows={2}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (newText.trim()) createMut.mutate(newText.trim()) }
              }}
              className="flex-1 resize-none rounded-2xl border border-input bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button
              onClick={() => { if (newText.trim()) createMut.mutate(newText.trim()) }}
              disabled={createMut.isPending || !newText.trim()}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
              aria-label="إرسال"
            >
              <Send className="size-4" />
            </button>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-12 animate-pulse rounded-xl bg-muted" />)}
            </div>
          ) : comments.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">لا توجد تعليقات — كن أول من يعلّق!</p>
          ) : (
            <div className={cn("space-y-3", comments.length > 5 && "max-h-[440px] overflow-y-auto pe-1")}>
              {comments.map(c => (
                <CommentRow
                  key={resolveId(c)}
                  comment={c}
                  groupId={groupId}
                  pid={pid}
                  canDeleteAll={canDeleteAll}
                  viewerId={viewerId}
                  onDelete={cid => deleteMut.mutate(cid)}
                  onReplySuccess={() => { /* already updated */ }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
