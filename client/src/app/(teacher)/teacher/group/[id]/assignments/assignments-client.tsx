"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import {
  deleteAssignmentAction,
  toggleAssignmentResultsAction,
  toggleAssignmentVisibilityAction,
} from "@/features/teacher/actions/assignment.action"
import { toArray } from "@/shared/lib/api-helpers"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiExamSubmission, ApiQuestion,
  AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Eye, EyeOff, BarChart2, Plus, Trash2, Users, X, XCircle, Pencil } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

// ─── Submissions Modal ────────────────────────────────────────────────────────
function SubmissionsModal({
  groupId,
  assignmentId,
  title,
  assignment,
  onClose,
}: {
  groupId:      string
  assignmentId: string
  title:        string
  assignment:   ApiAssignment
  onClose:      () => void
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  const questionsMap: Record<string, ApiQuestion> = {}
  for (const q of assignment.questions ?? []) {
    if (q._id) questionsMap[q._id] = q
  }

  const { data: raw, isLoading } = useQuery({
    queryKey: ["exam-submissions", assignmentId],
    queryFn:  () =>
      clientFetch<{ data: ApiExamSubmission[] }>(
        `/api/assignments/${assignmentId}/submissions?limit=100`
      ),
    enabled: !!assignmentId,
    refetchInterval: 15_000,
  })

  const submissions: ApiExamSubmission[] = (() => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiExamSubmission[]
    if (typeof raw === "object" && "data" in raw) return (raw as { data: ApiExamSubmission[] }).data ?? []
    return []
  })()

  const selectedSub = selected ? submissions.find(s =>
    (resolveId(s as { _id?: string; id?: string })) === selected
  ) : null

  function enrichAnswers(sub: ApiExamSubmission) {
    const details = sub.answersWithDetails
    if (details && details.length > 0 && details[0].questionText) return details
    return (sub.answers ?? []).map(a => {
      const q = questionsMap[a.questionId]
      return {
        questionId:    a.questionId,
        chosen:        a.chosen,
        questionText:  q?.text ?? `سؤال (${a.questionId.slice(-4)})`,
        correctAnswer: q?.correctAnswer ?? "",
        points:        q?.points ?? 1,
        isCorrect:     q ? a.chosen === q.correctAnswer : undefined,
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold">إجابات الطلاب</h2>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose()
                router.push(`/teacher/group/${groupId}/assignments/${assignmentId}/edit`)
              }}
              className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100 transition-colors dark:border-violet-800 dark:bg-violet-950/20 dark:text-violet-300"
              title="تعديل الامتحان والأسئلة"
            >
              <Pencil className="size-3.5" />
              <span>تعديل الامتحان</span>
            </button>
            <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 shrink-0 border-e border-border/40 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                <Users className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">لا توجد إجابات بعد</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {submissions.map(sub => {
                  const sid  = resolveId(sub as { _id?: string; id?: string })
                  const total = sub.total ?? 0
                  const score = sub.score ?? 0
                  const pct  = total ? Math.round((score / total) * 100) : 0
                  const st   = sub.student as { name?: string } | undefined
                  return (
                    <button
                      key={sid}
                      onClick={() => setSelected(prev => prev === sid ? null : sid)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-start transition-all",
                        selected === sid
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <p className="text-xs font-semibold truncate">{st?.name ?? "طالب"}</p>
                      <p className={cn("text-[10px] mt-0.5", selected === sid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {sub.score}/{sub.total} ({pct}٪)
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedSub ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <p className="text-3xl mb-2">👆</p>
                <p className="text-sm">اختر طالباً من القائمة لعرض إجاباته</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className={cn(
                  "rounded-2xl border p-4",
                  selectedSub.total && ((selectedSub.score ?? 0) / selectedSub.total) >= 0.5
                    ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20"
                    : "border-rose-200/60 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-950/20"
                )}>
                  <p className="text-lg font-extrabold">
                    {selectedSub.score ?? 0} / {selectedSub.total ?? 0}{" "}
                    <span className="text-sm font-medium text-muted-foreground">
                      ({selectedSub.total ? Math.round(((selectedSub.score ?? 0) / selectedSub.total) * 100) : 0}٪)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    تاريخ التسليم: {new Date(selectedSub.submittedAt).toLocaleDateString("ar-EG", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {enrichAnswers(selectedSub).map((ans, i) => (
                  <div key={ans.questionId + i} className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-lg text-[10px] font-bold",
                        ans.isCorrect === true  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        ans.isCorrect === false ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                        "bg-muted text-muted-foreground"
                      )}>{i + 1}</span>
                      <p className="flex-1 text-xs font-medium leading-snug">{ans.questionText ?? `سؤال ${i + 1}`}</p>
                      <span className="shrink-0 text-[10px] text-amber-600 font-bold">{ans.points}ن</span>
                      {ans.isCorrect === true  && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                      {ans.isCorrect === false && <XCircle      className="size-4 text-rose-500 shrink-0" />}
                    </div>
                    <div className="flex flex-wrap gap-2 ps-8 text-[11px]">
                      <span className={cn(
                        "rounded-lg border px-2 py-1 font-medium",
                        ans.isCorrect === true
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400"
                      )}>
                        اختار: <strong>{ans.chosen}</strong>
                      </span>
                      {ans.isCorrect === false && ans.correctAnswer && (
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                          الصحيحة: <strong>{ans.correctAnswer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page client ──────────────────────────────────────────────────────────────
interface AssignmentsClientProps {
  groupId:           string
  initialAssignments: ApiAssignment[]
  userName:          string
}

export default function AssignmentsClient({
  groupId,
  initialAssignments,
  userName,
}: AssignmentsClientProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const [deleteId,   setDeleteId]     = useState<string | null>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [viewSubs,   setViewSubs]     = useState<{ id: string; title: string } | null>(null)

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["teacher", "assignments", groupId],
    queryFn:  () =>
      clientFetch<PaginatedResponse<ApiAssignment>>(`/api/assignments/group/${groupId}?limit=50`).then(toArray<ApiAssignment>),
    enabled:  !!groupId,
    initialData: initialAssignments,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAssignmentAction(id, groupId),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] })
      setDeleteId(null)
    },
  })

  const toggleMut = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleAssignmentVisibilityAction(id, groupId)
      if ("error" in result) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] }),
  })

  const toggleResultsMut = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleAssignmentResultsAction(id, groupId)
      if ("error" in result) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] }),
  })

  return (
    <>
      {viewSubs && (
        <SubmissionsModal
          groupId={groupId}
          assignmentId={viewSubs.id}
          title={viewSubs.title}
          assignment={assignments.find(a => resolveId(a as { _id?: string; id?: string }) === viewSubs.id) ?? { questions: [] } as unknown as ApiAssignment}
          onClose={() => setViewSubs(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <p className="font-bold">حذف الواجب؟</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>إلغاء</Button>
              <Button variant="destructive" className="flex-1" onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <TopBar title="الواجبات والامتحانات" notifHref="/teacher/notifications"
          userName={userName} userAvatar={userName ? userName[0] : "م"} userAvatarColor="bg-violet-500" profileHref="/teacher/profile" />

        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{isLoading ? "جارٍ التحميل..." : `${assignments.length} عنصر`}</p>
            <Button onClick={() => router.push(`/teacher/group/${groupId}/assignments/new`)} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90">
              <Plus className="size-4" />إضافة
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
              <Button className="mt-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={() => router.push(`/teacher/group/${groupId}/assignments/new`)}>
                <Plus className="size-4" />إضافة أول واجب
              </Button>
            </div>
          ) : (
            assignments.map(a => {
              const aid    = resolveId(a as { _id?: string; id?: string })
              const isExam = a.type === AssignmentType.EXAM
              const isOpen = expandedId === aid
              const totalPoints = (a.questions ?? []).reduce((s, q) => s + (q.points ?? 1), 0)

              return (
                <div key={aid} className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden",
                  isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60")}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn("grid size-9 place-items-center rounded-xl shrink-0 text-base",
                          isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-violet-100 dark:bg-violet-900/30")}>
                          {isExam ? "📝" : "📚"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className={cn("text-[10px] rounded-full px-2 py-0.5 font-bold shrink-0",
                              isExam ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                     : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400")}>
                              {ASSIGNMENT_TYPE_LABELS[a.type]}
                            </span>
                            {a.durationMinutes && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="size-2.5" />{a.durationMinutes} دقيقة
                              </span>
                            )}
                            {(a.questions ?? []).length > 0 && (
                              <span className="text-[10px] rounded-full px-2 py-0.5 bg-violet-100 text-violet-700 font-bold dark:bg-violet-900/30 dark:text-violet-400">
                                {a.questions.length} سؤال · {totalPoints} نقطة
                              </span>
                            )}
                            {a.isHidden && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                <EyeOff className="size-2.5" />مخفي
                              </span>
                            )}
                            {isExam && !a.showResults && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 font-bold dark:bg-slate-800/30 dark:text-slate-400">
                                <BarChart2 className="size-2.5" />النتائج مخفية
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-sm truncate">{a.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {(a.questions ?? []).length > 0 && (
                          <button onClick={() => setExpandedId(isOpen ? null : aid)}
                            className="grid size-8 place-items-center rounded-xl border border-border/60 text-muted-foreground hover:bg-muted transition-colors">
                            {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </button>
                        )}
                        <button
                          onClick={() => toggleMut.mutate(aid)}
                          disabled={toggleMut.isPending}
                          className={cn(
                            "grid size-8 place-items-center rounded-xl border transition-colors",
                            a.isHidden
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/20"
                              : "border-border/60 text-muted-foreground hover:bg-muted"
                          )}
                          title={a.isHidden ? "إظهار للطلاب" : "إخفاء عن الطلاب"}
                        >
                          {a.isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                        {isExam && (
                          <button
                            onClick={() => setViewSubs({ id: aid, title: a.title })}
                            className="flex h-8 items-center gap-1 rounded-xl border border-teal-200 px-2 text-teal-600 hover:bg-teal-50 transition-colors dark:border-teal-800 dark:hover:bg-teal-950/20"
                            title="عرض نتائج وإجابات الطلاب"
                          >
                            <Users className="size-3.5" />
                            <span className="hidden sm:inline text-[10px] font-bold">نتائج الطلاب</span>
                          </button>
                        )}
                        {isExam && (
                          <button
                            onClick={() => toggleResultsMut.mutate(aid)}
                            disabled={toggleResultsMut.isPending}
                            className={cn(
                              "flex h-8 items-center gap-1 rounded-xl border px-2 transition-colors",
                              a.showResults
                                ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/20"
                                : "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/20"
                            )}
                            title={a.showResults ? "النتائج ظاهرة للطلاب — اضغط لإخفائها" : "النتائج مخفية — اضغط لإظهارها"}
                          >
                            <BarChart2 className="size-3.5" />
                            <span className="hidden sm:inline text-[10px] font-bold">
                              {a.showResults ? "إخفاء النتيجة" : "إظهار النتيجة"}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/teacher/group/${groupId}/assignments/${aid}/edit`)}
                          className="grid size-8 place-items-center rounded-xl border border-border/60 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                          title="تعديل"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button onClick={() => setDeleteId(aid)}
                          className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {a.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-line">{a.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {a.dueDate && (
                        <span>📅 {new Date(a.dueDate).toLocaleDateString("ar-EG", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}</span>
                      )}
                      {a.youtubeUrl && (
                        <a href={a.youtubeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-rose-600 hover:underline">
                          <ExternalLink className="size-3" />مشاهدة الفيديو
                        </a>
                      )}
                      <span className="ms-auto">{new Date(a.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>

                  {isOpen && (a.questions ?? []).length > 0 && (
                    <div className="border-t border-border/40 bg-muted/20 p-4 space-y-3">
                      <p className="text-xs font-bold text-muted-foreground mb-2">الأسئلة:</p>
                      {a.questions.map((q, qi) => (
                        <div key={q._id ?? qi} className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="grid size-5 shrink-0 place-items-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 mt-0.5">
                              {qi + 1}
                            </span>
                            <p className="text-sm font-medium leading-snug">{q.text}</p>
                            <span className="ms-auto shrink-0 text-[10px] text-amber-600 font-bold">{q.points} نقطة</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 ps-7">
                            {q.choices.map(c => (
                              <div key={c.id} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs",
                                c.id === q.correctAnswer
                                  ? "bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-muted text-muted-foreground")}>
                                <span className="font-bold shrink-0">{c.id}</span>
                                <span className="truncate">{c.text}</span>
                                {c.id === q.correctAnswer && <span className="ms-auto shrink-0">✓</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
