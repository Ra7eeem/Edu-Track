"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BookOpen, ClipboardList, ExternalLink, Plus, Trash2, X } from "lucide-react"
import { use, useRef, useState } from "react"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateAssignmentModal({
  groupId, onClose,
}: { groupId: string; onClose: () => void }) {
  const qc         = useQueryClient()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [type,        setType]        = useState<AssignmentType>(AssignmentType.HOMEWORK)
  const [title,       setTitle]       = useState("")
  const [description, setDescription] = useState("")
  const [youtubeUrl,  setYoutubeUrl]  = useState("")
  const [dueDate,     setDueDate]     = useState("")
  const [error,       setError]       = useState<string | null>(null)

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch<ApiAssignment>("/api/assignments", { method: "POST", data: body } as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", groupId] })
      onClose()
    },
  })

  const handleSubmit = async () => {
    if (!title.trim()) { setError("العنوان مطلوب"); return }
    setError(null)
    try {
      await createMut.mutateAsync({
        groupId,
        type,
        title:       title.trim(),
        description: description.trim() || undefined,
        youtubeUrl:  youtubeUrl.trim()  || undefined,
        dueDate:     dueDate            || undefined,
      })
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
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <h2 className="text-base font-bold">إضافة واجب / امتحان</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

          {/* Type */}
          <div className="flex gap-2">
            {([AssignmentType.HOMEWORK, AssignmentType.EXAM] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 rounded-2xl border py-2.5 text-sm font-medium transition-all",
                  type === t
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {t === AssignmentType.HOMEWORK ? "📚 واجب" : "📝 امتحان"}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">العنوان *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={type === AssignmentType.EXAM ? "مثال: امتحان الفصل الأول" : "مثال: واجب الدرس الخامس"}
              autoFocus
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف / التعليمات (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب تعليمات الواجب هنا..."
              rows={3}
              className="flex w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* YouTube */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">رابط يوتيوب (اختياري)</label>
            <input
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">تاريخ التسليم (اختياري)</label>
            <input
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              type="datetime-local"
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 border-t border-border/60 px-5 py-4 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={createMut.isPending}
          >
            <Plus className="size-4" />{createMut.isPending ? "جارٍ الإضافة..." : "إضافة"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherAssignmentsPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params)
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["assignments", groupId],
    queryFn:  () => clientFetch<PaginatedResponse<ApiAssignment>>(
      `/api/assignments/group/${groupId}?limit=50`
    ),
    enabled: !!groupId,
  })
  const assignments = toArray<ApiAssignment>(rawData)

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      clientFetch(`/api/assignments/${id}`, { method: "DELETE" } as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", groupId] })
      setDeleteId(null)
    },
  })

  return (
    <>
      {showCreate && <CreateAssignmentModal groupId={groupId} onClose={() => setShowCreate(false)} />}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <p className="font-bold">حذف الواجب؟</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>إلغاء</Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteMut.mutate(deleteId)}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <TopBar
          title="الواجبات والامتحانات"
          notifHref="/teacher/notifications"
          userName=""
          userAvatar="م"
          userAvatarColor="bg-violet-500"
          profileHref="/teacher/profile"
        />

        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "جارٍ التحميل..." : `${assignments.length} عنصر`}
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            >
              <Plus className="size-4" />إضافة واجب
            </Button>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border/60 bg-muted" />
            ))
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="font-medium">لا توجد واجبات بعد</p>
              <Button
                className="mt-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                onClick={() => setShowCreate(true)}
              >
                <Plus className="size-4" />إضافة أول واجب
              </Button>
            </div>
          ) : (
            assignments.map(a => {
              const aid  = resolveId(a as { _id?: string; id?: string })
              const isExam = a.type === AssignmentType.EXAM
              return (
                <div
                  key={aid}
                  className={cn(
                    "rounded-2xl border bg-card shadow-sm overflow-hidden",
                    isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60"
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn(
                          "grid size-9 place-items-center rounded-xl shrink-0 text-base",
                          isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-violet-100 dark:bg-violet-900/30"
                        )}>
                          {isExam ? "📝" : "📚"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[10px] rounded-full px-2 py-0.5 font-bold shrink-0",
                              isExam
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                            )}>
                              {ASSIGNMENT_TYPE_LABELS[a.type]}
                            </span>
                          </div>
                          <p className="mt-0.5 font-bold text-sm truncate">{a.title}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteId(aid)}
                        className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20 shrink-0"
                        aria-label="حذف"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {a.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3 whitespace-pre-line">
                        {a.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {a.dueDate && (
                        <span className="flex items-center gap-1">
                          📅 {new Date(a.dueDate).toLocaleDateString("ar-EG", {
                            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      )}
                      {a.youtubeUrl && (
                        <a
                          href={a.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-rose-600 hover:underline"
                        >
                          <ExternalLink className="size-3" />مشاهدة الفيديو
                        </a>
                      )}
                      <span className="ms-auto">
                        {new Date(a.createdAt).toLocaleDateString("ar-EG")}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
