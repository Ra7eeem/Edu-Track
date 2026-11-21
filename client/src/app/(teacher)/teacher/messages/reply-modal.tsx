"use client"

import { replyAnonymousMessageAction } from "@/features/teacher/actions/message.action"
import { Button } from "@/shared/components/ui/button"
import { Send, X } from "lucide-react"
import { useRef, useState, useTransition } from "react"

export function TeacherReplyModal({
  messageId,
  currentReply,
  onClose,
}: {
  messageId: string
  currentReply: string | null
  onClose: () => void
}) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [reply, setReply] = useState(currentReply ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    if (!reply.trim()) { setError("الرد لا يمكن أن يكون فارغاً"); return }
    setError(null)
    startTransition(async () => {
      const result = await replyAnonymousMessageAction(messageId, reply.trim())
      if (result.error) setError(result.error)
      else onClose()
    })
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
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>إلغاء</Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
            onClick={handleSubmit}
            disabled={isPending}
          >
            <Send className="size-4" />{isPending ? "جارٍ الإرسال..." : "إرسال الرد"}
          </Button>
        </div>
      </div>
    </div>
  )
}
