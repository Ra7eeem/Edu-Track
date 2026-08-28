"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiAnonymousMessage, PaginatedResponse, resolveId } from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Send, X } from "lucide-react"
import { useRef, useState } from "react"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

// ─── Reply Modal ──────────────────────────────────────────────────────────────
function ReplyModal({
  messageId, currentReply, onClose,
}: { messageId: string; currentReply: string | null; onClose: () => void }) {
  const qc         = useQueryClient()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [reply, setReply] = useState(currentReply ?? "")
  const [error, setError] = useState<string | null>(null)

  const replyMut = useMutation({
    mutationFn: (body: { reply: string }) =>
      clientFetch(`/api/anonymous/${messageId}/reply`, {
        method: "POST", data: body,
      } as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "anonymous"] })
      onClose()
    },
  })

  const handleSubmit = async () => {
    if (!reply.trim()) { setError("الرد لا يمكن أن يكون فارغاً"); return }
    setError(null)
    try {
      await replyMut.mutateAsync({ reply: reply.trim() })
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "حدث خطأ")
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">الرد على الرسالة</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="اكتب ردك هنا..."
            rows={4}
            autoFocus
            className="flex w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={replyMut.isPending}
          >
            <Send className="size-4" />{replyMut.isPending ? "جارٍ الإرسال..." : "إرسال الرد"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherMessagesPage() {
  const [replyTarget, setReplyTarget] = useState<{ id: string; reply: string | null } | null>(null)
  const [filter, setFilter] = useState<"all" | "unanswered" | "answered">("all")

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["teacher", "anonymous"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiAnonymousMessage>>("/api/anonymous/inbox?limit=100"),
  })
  const allMessages = toArray<ApiAnonymousMessage>(rawData)

  const messages = allMessages.filter(m => {
    if (filter === "unanswered") return !m.reply
    if (filter === "answered")   return  !!m.reply
    return true
  })

  const unansweredCount = allMessages.filter(m => !m.reply).length

  return (
    <>
      {replyTarget && (
        <ReplyModal
          messageId={replyTarget.id}
          currentReply={replyTarget.reply}
          onClose={() => setReplyTarget(null)}
        />
      )}

      <div className="flex flex-col">
        <TopBar
          title="الرسائل المجهولة"
          notifHref="/teacher/notifications"
          userName=""
          userAvatar="م"
          userAvatarColor="bg-violet-500"
          profileHref="/teacher/profile"
        />

        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-1 rounded-2xl border border-border/60 bg-card p-1">
            {([
              { key: "all",        label: `الكل (${allMessages.length})` },
              { key: "unanswered", label: `لم يُرَد (${unansweredCount})` },
              { key: "answered",   label: "تم الرد" },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex-1 rounded-xl py-2 text-xs font-medium transition-all ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted" />
            ))
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-4xl mb-3">📬</p>
              <p className="font-medium">لا توجد رسائل</p>
              <p className="mt-1 text-sm text-muted-foreground">ستظهر هنا الرسائل المجهولة من طلابك</p>
            </div>
          ) : (
            messages.map(msg => {
              const mid   = resolveId(msg as { _id?: string; id?: string })
              const group = msg.group as { name?: string } | undefined
              return (
                <div
                  key={mid}
                  className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${
                    !msg.reply ? "border-amber-200/60 dark:border-amber-800/30" : "border-border/60"
                  }`}
                >
                  {/* Message header */}
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-slate-100 text-sm dark:bg-slate-800">🎭</span>
                      <span className="text-xs font-medium text-muted-foreground">طالب مجهول</span>
                      {group?.name && (
                        <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{group.name}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="px-4 py-3">
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>

                  {/* Reply section */}
                  {msg.reply ? (
                    <div className="border-t border-border/40 bg-violet-50/40 dark:bg-violet-950/10 p-4">
                      <p className="text-xs font-semibold text-violet-700 dark:text-violet-400 mb-1">ردك:</p>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.reply}</p>
                      <button
                        onClick={() => setReplyTarget({ id: mid, reply: msg.reply })}
                        className="mt-2 text-[10px] text-muted-foreground underline hover:text-foreground"
                      >
                        تعديل الرد
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-border/40 px-4 py-3">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                        onClick={() => setReplyTarget({ id: mid, reply: null })}
                      >
                        <Send className="size-3.5" />رد على الرسالة
                      </Button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
