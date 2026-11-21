"use client"

import { Button } from "@/shared/components/ui/button"
import { ApiAnonymousMessage, resolveId } from "@/shared/types/api"
import { Send } from "lucide-react"
import { useState } from "react"
import { TeacherReplyModal } from "./reply-modal"

type Filter = "all" | "unanswered" | "answered"

export function TeacherMessagesClient({ messages }: { messages: ApiAnonymousMessage[] }) {
  const [replyTarget, setReplyTarget] = useState<{ id: string; reply: string | null } | null>(null)
  const [filter, setFilter] = useState<Filter>("all")

  const allMessages = messages ?? []

  const filtered = allMessages.filter(m => {
    if (filter === "unanswered") return !m.reply
    if (filter === "answered")   return  !!m.reply
    return true
  })

  const unansweredCount = allMessages.filter(m => !m.reply).length

  return (
    <>
      {replyTarget && (
        <TeacherReplyModal
          messageId={replyTarget.id}
          currentReply={replyTarget.reply}
          onClose={() => setReplyTarget(null)}
        />
      )}

      <div className="space-y-4">
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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="font-medium">لا توجد رسائل</p>
            <p className="mt-1 text-sm text-muted-foreground">ستظهر هنا الرسائل المجهولة من طلابك</p>
          </div>
        ) : (
          filtered.map(msg => {
            const mid     = resolveId(msg as { _id?: string; id?: string })
            const group   = msg.group as { name?: string } | undefined
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
                  <div className="border-t border-border/40 bg-primary/5/40 dark:bg-card p-4">
                    <p className="text-xs font-semibold text-primary dark:text-primary mb-1">ردك:</p>
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
                      className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
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
    </>
  )
}
