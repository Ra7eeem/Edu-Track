"use client"

import { TopBar }     from "@/shared/components/layout/topbar"
import { Button }     from "@/shared/components/ui/button"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiExamSubmission, ApiGroup, ApiQuestion,
  AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn }          from "@/shared/lib/tailwind-cn"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Send, XCircle } from "lucide-react"
import { useState } from "react"

function toArr<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

// ─── Exam solver modal ─────────────────────────────────────────────────────────
function ExamSolverModal({
  assignment,
  groupId,
  onClose,
}: {
  assignment: ApiAssignment
  groupId:    string
  onClose:    () => void
}) {
  const aid = resolveId(assignment as { _id?: string; id?: string })
  const questions: ApiQuestion[] = assignment.questions ?? []
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const qc = useQueryClient()

  const submitMut = useMutation({
    mutationFn: () =>
      clientFetch<ApiExamSubmission>(`/api/assignments/${aid}/submit`, {
        method: "POST",
        data:   { answers: Object.entries(answers).map(([questionId, chosen]) => ({ questionId, chosen })) },
      } as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exam-submission", aid] })
      onClose()
    },
  })

  const answered = Object.keys(answers).length
  const allAnswered = answered === questions.length

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold">{assignment.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {answered}/{questions.length} سؤال مُجاب
              {assignment.durationMinutes && ` · ${assignment.durationMinutes} دقيقة`}
            </p>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted shrink-0">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${questions.length ? (answered / questions.length) * 100 : 0}%` }}
          />
        </div>

        {/* Questions */}
        <div className="overflow-y-auto p-5 space-y-5 flex-1">
          {submitMut.isError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {(submitMut.error as { message?: string })?.message ?? "حدث خطأ، حاول مجدداً"}
            </div>
          )}

          {questions.map((q, qi) => {
            const qid      = q._id ?? String(qi)
            const selected = answers[qid]
            return (
              <div key={qid} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary mt-0.5">
                    {qi + 1}
                  </span>
                  <p className="flex-1 text-sm font-medium leading-snug">{q.text}</p>
                  <span className="text-[10px] font-bold text-amber-600 shrink-0">{q.points} نقطة</span>
                </div>
                <div className="grid gap-2 ps-10">
                  {q.choices.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setAnswers(prev => ({ ...prev, [qid]: c.id }))}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-start transition-all",
                        selected === c.id
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border/50 bg-muted/30 hover:bg-muted hover:border-border"
                      )}
                    >
                      <span className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-lg text-xs font-bold border",
                        selected === c.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border"
                      )}>
                        {c.id}
                      </span>
                      <span>{c.text}</span>
                      {selected === c.id && <CheckCircle2 className="size-4 ms-auto text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-5 py-4 shrink-0 flex items-center gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">إلغاء</Button>
          <Button
            onClick={() => submitMut.mutate()}
            disabled={submitMut.isPending || !allAnswered}
            className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90"
          >
            <Send className="size-4" />
            {submitMut.isPending ? "جارٍ الإرسال..." : "إرسال الإجابات"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Assignment Card ──────────────────────────────────────────────────────────
function AssignmentCard({ assignment: a, groupId }: { assignment: ApiAssignment; groupId: string }) {
  const [open,       setOpen]       = useState(false)
  const [showSolver, setShowSolver] = useState(false)

  const aid    = resolveId(a as { _id?: string; id?: string })
  const isExam = a.type === AssignmentType.EXAM
  const isPast = a.dueDate ? new Date(a.dueDate) < new Date() : false
  const daysLeft = a.dueDate
    ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000)
    : null
  const questions: ApiQuestion[] = a.questions ?? []
  const totalPts = questions.reduce((s, q) => s + (q.points ?? 1), 0)

  // Check if already submitted
  const { data: submission } = useQuery({
    queryKey: ["exam-submission", aid],
    queryFn:  () => clientFetch<ApiExamSubmission | null>(`/api/assignments/${aid}/my-submission`),
    enabled:  isExam && !!aid,
    staleTime: 5 * 60_000,
  })

  const submitted = !!(submission as ApiExamSubmission | null | undefined)

  return (
    <>
      {showSolver && (
        <ExamSolverModal
          assignment={a}
          groupId={groupId}
          onClose={() => setShowSolver(false)}
        />
      )}

      <div className={cn(
        "rounded-2xl border bg-card shadow-sm overflow-hidden",
        isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60"
      )}>
        <div className="p-4 space-y-2">
          {/* Header */}
          <div className="flex items-start gap-3">
            <span className={cn(
              "grid size-10 place-items-center rounded-xl shrink-0 text-lg",
              isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-teal-100 dark:bg-teal-900/30"
            )}>
              {isExam ? "📝" : "📚"}
            </span>
            <div className="min-w-0 flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-1">
                <span className={cn(
                  "text-[10px] rounded-full px-2 py-0.5 font-bold",
                  isExam
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                )}>
                  {ASSIGNMENT_TYPE_LABELS[a.type]}
                </span>
                {a.durationMinutes && (
                  <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock className="size-2.5" />{a.durationMinutes} دقيقة
                  </span>
                )}
                {questions.length > 0 && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 bg-primary/10 text-primary font-bold">
                    {questions.length} سؤال · {totalPts} نقطة
                  </span>
                )}
                {daysLeft !== null && !isPast && daysLeft <= 3 && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {daysLeft === 0 ? "اليوم!" : `${daysLeft} أيام`}
                  </span>
                )}
                {isPast && (
                  <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-muted text-muted-foreground">منتهي</span>
                )}
                {/* Submitted badge */}
                {submitted && isExam && (
                  <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <CheckCircle2 className="size-2.5" />تم التسليم
                  </span>
                )}
              </div>
              <p className="font-bold text-sm">{a.title}</p>
            </div>

            {/* Expand toggle */}
            {questions.length > 0 && (
              <button
                onClick={() => setOpen(p => !p)}
                className="grid size-8 place-items-center rounded-xl border border-border/60 text-muted-foreground hover:bg-muted transition-colors shrink-0"
              >
                {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            )}
          </div>

          {a.description && (
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{a.description}</p>
          )}
          {a.youtubeUrl && (
            <a href={a.youtubeUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/40 px-3 py-2.5 text-xs text-rose-700 hover:bg-rose-50 transition-colors dark:border-rose-800/30 dark:bg-rose-950/10 dark:text-rose-400">
              <span className="text-base">▶️</span>
              <span className="flex-1 truncate">مشاهدة فيديو الشرح</span>
              <ExternalLink className="size-3.5 shrink-0" />
            </a>
          )}
          {a.dueDate && (
            <p className="text-xs text-muted-foreground">
              📅 موعد التسليم:{" "}
              <span className={cn("font-medium", isPast ? "text-rose-600" : "text-foreground")}>
                {new Date(a.dueDate).toLocaleDateString("ar-EG", {
                  weekday:"short", year:"numeric", month:"short", day:"numeric",
                  hour:"2-digit", minute:"2-digit",
                })}
              </span>
            </p>
          )}

          {/* Submission result */}
          {submitted && isExam && (
            <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                درجتك: {(submission as ApiExamSubmission).score} / {(submission as ApiExamSubmission).total}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Math.round(((submission as ApiExamSubmission).score / Math.max((submission as ApiExamSubmission).total, 1)) * 100)}٪ من الدرجة الكاملة
              </p>
            </div>
          )}

          {/* Solve exam button */}
          {isExam && !submitted && !isPast && questions.length > 0 && (
            <Button
              onClick={() => setShowSolver(true)}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90 mt-1"
              size="sm"
            >
              📝 حل الامتحان
            </Button>
          )}
        </div>

        {/* View questions (read-only) */}
        {open && questions.length > 0 && (
          <div className="border-t border-border/40 bg-muted/20 p-4 space-y-4">
            {a.durationMinutes && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200/60 px-3 py-2 dark:bg-amber-950/20 dark:border-amber-800/30">
                <Clock className="size-4 text-amber-600 shrink-0" />
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  مدة الامتحان: {a.durationMinutes} دقيقة
                </p>
              </div>
            )}
            {questions.map((q, qi) => {
              const qid      = q._id ?? String(qi)
              const myAnswer = (submission as ApiExamSubmission | null)?.answers?.find(a => a.questionId === qid)
              const isCorrect = myAnswer && (submission as ApiExamSubmission | null)?.answersWithDetails
                ? (submission as ApiExamSubmission).answersWithDetails?.find(a => a.questionId === qid)?.isCorrect
                : undefined
              return (
                <div key={qid} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                      {qi + 1}
                    </span>
                    <p className="text-sm font-medium leading-snug flex-1">{q.text}</p>
                    <span className="shrink-0 text-[10px] text-amber-600 font-bold">{q.points} نقطة</span>
                  </div>
                  <div className="grid gap-2 ps-8">
                    {q.choices.map(c => {
                      const isMyChoice = myAnswer?.chosen === c.id
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm",
                            isMyChoice && isCorrect === true  ? "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20" :
                            isMyChoice && isCorrect === false ? "border-rose-300 bg-rose-50/60 dark:bg-rose-950/20" :
                            isMyChoice ? "border-primary/40 bg-primary/5" :
                            "border-border/50 bg-muted/30"
                          )}
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-card border border-border text-xs font-bold">
                            {c.id}
                          </span>
                          <span className="flex-1">{c.text}</span>
                          {isMyChoice && isCorrect === true  && <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />}
                          {isMyChoice && isCorrect === false && <XCircle      className="size-4 text-rose-500 shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentAssignmentsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const { data: groupsRaw, isLoading: gLoading } = useQuery({
    queryKey: ["student", "groups"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiGroup>>("/api/students/me/groups?limit=20"),
  })
  const groups     = toArr<ApiGroup>(groupsRaw)
  const firstGid   = resolveId(groups[0] as { _id?: string; id?: string } | undefined ?? {})
  const activeGid  = selectedGroupId ?? firstGid

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["assignments", activeGid],
    queryFn:  () => clientFetch<PaginatedResponse<ApiAssignment>>(`/api/assignments/group/${activeGid}?limit=50`),
    enabled:  !!activeGid && activeGid.length > 0,
    placeholderData: prev => prev,
  })
  const assignments = toArr<ApiAssignment>(rawData)
  const now         = new Date()
  const upcoming    = assignments.filter(a => !a.dueDate || new Date(a.dueDate) >= now)
  const past        = assignments.filter(a =>  a.dueDate  && new Date(a.dueDate) <  now)

  return (
    <div className="flex flex-col">
      <TopBar title="الواجبات والامتحانات" notifHref="/student/notifications"
        userName="" userAvatar="أ" userAvatarColor="bg-teal-500" profileHref="/student/profile" />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
        {groups.length > 1 && (
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card p-1">
            {groups.map(g => {
              const gid = resolveId(g as { _id?: string; id?: string })
              return (
                <button key={gid} onClick={() => setSelectedGroupId(gid)}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                    activeGid === gid ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}>
                  {g.name}
                </button>
              )
            })}
          </div>
        )}

        {(isLoading || gLoading) ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border/60 bg-muted" />
          ))
        ) : assignments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-medium">لا توجد واجبات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">سيضيف مدرسك الواجبات هنا</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">القادمة ({upcoming.length})</h3>
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <AssignmentCard key={resolveId(a as { _id?: string; id?: string })} assignment={a} groupId={activeGid} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground/60 uppercase">المنتهية ({past.length})</h3>
                <div className="space-y-3 opacity-75">
                  {past.map(a => (
                    <AssignmentCard key={resolveId(a as { _id?: string; id?: string })} assignment={a} groupId={activeGid} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
