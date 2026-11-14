"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import {
  studentDeleteMessageAction,
  studentSendMessageAction,
} from "@/features/student/actions/message.action"
import { useStudentGroups, useStudentMe } from "@/features/student/hooks/use-student"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAnonymousMessage,
  ApiGroup,
  ApiUser,
  PaginatedResponse,
  resolveId,
} from "@/shared/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageCircle, Send, Trash2, X } from "lucide-react"
import { useRef, useState } from "react"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

// ─── Send Modal ───────────────────────────────────────────────────────────────
function SendModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const overlayRef = useRef<HTMLDivElement>(null)

  // Load student's groups using the cached hook with 5 min staleTime
  const { data: groupsRaw } = useStudentGroups()
  const groups = toArray<ApiGroup>(groupsRaw)

  const [groupId, setGroupId] = useState("")
  const [teacherId, setTeacherId] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Load teachers of selected group
  const { data: teachersRaw } = useQuery({
    queryKey: ["group", groupId, "teachers"],
    queryFn: () => clientFetch<ApiUser[]>(`/api/groups/${groupId}/teachers`),
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
  const teachers = toArray<ApiUser>(teachersRaw)

  const sendMut = useMutation({
    mutationFn: (values: { groupId: string; teacherId: string; content: string }) =>
      studentSendMessageAction(values),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["student", "anonymous"] })
        onClose()
      } else {
        setError(res.error || "فشل إرسال الرسالة")
      }
    },
    onError: (err: unknown) => {
      setError((err as { message?: string })?.message ?? "حدث خطأ أثناء الإرسال")
    },
  })

  const handleSend = () => {
    if (!groupId || !teacherId || !content.trim()) {
      setError("أكمل جميع الحقول")
      return
    }
    setError(null)
    sendMut.mutate({ groupId, teacherId, content: content.trim() })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <MessageCircle className="size-4 text-cyan-500" />
            رسالة مجهولة للمدرس
          </h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
            🔒 هويتك مجهولة تماماً — المدرس لن يعرف من أنت
          </p>

          {/* Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">اختر المجموعة</label>
            <select
              value={groupId}
              onChange={(e) => {
                setGroupId(e.target.value)
                setTeacherId("")
              }}
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            >
              <option value="">— اختر مجموعة —</option>
              {groups.map((g) => (
                <option key={resolveId(g)} value={resolveId(g)}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          {groupId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">اختر المدرس</label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
              >
                <option value="">— اختر المدرس —</option>
                {teachers.map((t) => (
                  <option key={resolveId(t)} value={resolveId(t)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الرسالة</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              rows={4}
              className="flex w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            إلغاء
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:opacity-90"
            onClick={handleSend}
            disabled={sendMut.isPending}
          >
            <Send className="size-4" />
            {sendMut.isPending ? "جارٍ الإرسال..." : "إرسال"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentMessagesPage() {
  const [showSend, setShowSend] = useState(false)
  const qc = useQueryClient()
  const { data: user } = useStudentMe()

  const deleteMut = useMutation({
    mutationFn: (id: string) => studentDeleteMessageAction(id),
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["student", "anonymous"] })
      }
    },
  })

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["student", "anonymous"],
    queryFn: () =>
      clientFetch<PaginatedResponse<ApiAnonymousMessage>>("/api/anonymous/me?limit=50"),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  })
  const messages = toArray<ApiAnonymousMessage>(rawData)

  const name = user?.name ?? ""

  return (
    <>
      {showSend && <SendModal onClose={() => setShowSend(false)} />}

      <div className="flex flex-col">
        <TopBar
          title="الرسائل المجهولة"
          notifHref="/student/notifications"
          userName={name}
          userAvatar={name[0] ?? "أ"}
          userAvatarColor="bg-cyan-500"
          profileHref="/student/profile"
        />

        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
          {/* Send button */}
          <Button
            onClick={() => setShowSend(true)}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:opacity-90"
          >
            <Send className="size-4" />
            إرسال رسالة مجهولة للمدرس
          </Button>

          {/* Messages list */}
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-border/60 bg-muted"
              />
            ))
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-4xl mb-3">🔒</p>
              <p className="font-medium">لا توجد رسائل بعد</p>
              <p className="mt-1 text-sm text-muted-foreground">ابعث رسالة مجهولة لمدرسك</p>
            </div>
          ) : (
            messages.map((msg) => {
              const mid = resolveId(msg as { _id?: string; id?: string })
              const teacher = msg.teacher as { name?: string } | undefined
              const group = msg.group as { name?: string } | undefined
              return (
                <div
                  key={mid}
                  className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
                >
                  {/* Message */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-cyan-600">📨 رسالتك</span>
                        {group?.name && (
                          <span className="text-[10px] bg-muted rounded-full px-2 py-0.5 text-muted-foreground">
                            {group.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                        {!msg.reply && (
                          <button
                            onClick={() => deleteMut.mutate(mid)}
                            disabled={deleteMut.isPending}
                            className="grid size-6 place-items-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors dark:hover:bg-rose-950/20"
                            title="حذف الرسالة"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                  </div>

                  {/* Reply */}
                  {msg.reply ? (
                    <div className="border-t border-border/40 bg-violet-50/40 dark:bg-violet-950/10 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                          {(teacher?.name ?? "م")[0]}
                        </span>
                        <span className="text-xs font-semibold text-violet-700 dark:text-violet-400">
                          {teacher?.name ?? "المدرس"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-line">{msg.reply}</p>
                    </div>
                  ) : (
                    <div className="border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
                      ⏳ في انتظار رد المدرس...
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
