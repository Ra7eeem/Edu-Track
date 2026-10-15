"use client"

import { submitExamAction } from "@/features/student/actions/exam.action"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/tailwind-cn"
import { ApiAssignment, resolveId } from "@/shared/types/api"
import { AlertTriangle, CheckCircle2, Clock, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"

export function ExamTaker({
  assignment,
  groupId,
}: {
  assignment: ApiAssignment
  groupId:    string
}) {
  const router     = useRouter()
  const aid        = resolveId(assignment)
  const questions  = assignment.questions ?? []
  const totalSecs  = (assignment.durationMinutes ?? 60) * 60

  const [answers,  setAnswers]  = useState<Record<string, string>>({})
  const [secsLeft, setSecsLeft] = useState(totalSecs)
  const [warning,  setWarning]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [pending,  startTransition] = useTransition()

  const submitted  = useRef(false)
  const answersRef = useRef<Record<string, string>>({})

  const updateAnswers = (fn: (prev: Record<string, string>) => Record<string, string>) => {
    setAnswers((prev) => {
      const next = fn(prev)
      answersRef.current = next
      return next
    })
  }

  const submit = useCallback((ans: Record<string, string>) => {
    if (submitted.current || pending) return
    startTransition(async () => {
      const result = await submitExamAction(
        aid,
        Object.entries(ans).map(([questionId, chosen]) => ({ questionId, chosen })),
        groupId
      )
      if ("error" in result) {
        setError(result.error)
        return
      }
      submitted.current = true
      router.replace(`/student/exams/${aid}/results`)
    })
  }, [aid, groupId, pending, router])

  useEffect(() => {
    const id = setInterval(() => {
      setSecsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          submit(answersRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [submit])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submitted.current) return
      e.preventDefault()
      e.returnValue = ""
    }
    const handleVisibility = () => {
      if (document.hidden && !submitted.current) submit(answersRef.current)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [submit])

  const mins     = Math.floor(secsLeft / 60)
  const secs     = secsLeft % 60
  const pct      = Math.round((secsLeft / totalSecs) * 100)
  const isRed    = secsLeft <= 60
  const isAmber  = secsLeft <= 300 && !isRed
  const answered = Object.keys(answers).length

  const scrollToQuestion = (qid: string) => {
    const el = document.getElementById(`q-card-${qid}`)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background">
      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs sm:text-sm font-bold text-foreground">{assignment.title}</p>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            <span className="font-semibold text-teal-600 dark:text-teal-400">{answered}/{questions.length} مُجاب</span>
            {questions.length > 0 && (
              <span className="text-[10px] text-muted-foreground">({Math.round((answered / questions.length) * 100)}٪)</span>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className={cn(
          "flex items-center gap-1.5 rounded-xl border px-2.5 py-1 sm:px-3 sm:py-1.5 font-mono text-xs sm:text-sm font-bold tabular-nums shrink-0 transition-colors",
          isRed   ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse" :
          isAmber ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400" :
                    "border-border/60 bg-muted/40 text-foreground"
        )}>
          <Clock className="size-3 sm:size-3.5" />
          <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
        </div>

        {/* Submit Button */}
        <Button
          size="sm"
          className="bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90 shrink-0 h-8 sm:h-9 px-2.5 sm:px-3 text-xs sm:text-sm font-bold shadow-sm shadow-teal-500/20"
          onClick={() => setWarning(true)}
          disabled={pending}
        >
          <Send className="size-3 sm:size-3.5" />
          <span>{pending ? "جارٍ..." : "تسليم"}</span>
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 shrink-0 bg-muted">
        <div
          className={cn("h-full transition-all duration-1000", isRed ? "bg-rose-500" : isAmber ? "bg-amber-500" : "bg-teal-500")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Mobile Question Quick-Nav Strip */}
      {questions.length > 1 && (
        <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border/40 bg-card/60 px-3 py-2 backdrop-blur-sm scrollbar-none">
          <span className="text-[10px] font-bold text-muted-foreground shrink-0 ms-1">الأسئلة:</span>
          {questions.map((q, qi) => {
            const qid = q._id ?? String(qi)
            const isDone = Boolean(answers[qid])
            return (
              <button
                key={qid}
                type="button"
                onClick={() => scrollToQuestion(qid)}
                className={cn(
                  "grid size-6 sm:size-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-all border",
                  isDone
                    ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted"
                )}
                title={`انتقل إلى السؤال ${qi + 1}`}
              >
                {qi + 1}
              </button>
            )
          })}
        </div>
      )}

      {warning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-background p-6 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <AlertTriangle className="mx-auto mb-3 size-10 text-amber-500" />
            <h3 className="font-bold text-base">هل تريد تسليم الامتحان؟</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              أجبت عن {answered} من إجمالي {questions.length} سؤال. سيتم تسجيل إجاباتك الحالية فوراً.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl h-10 text-xs sm:text-sm" onClick={() => setWarning(false)}>
                متابعة الحل
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90 rounded-xl h-10 text-xs sm:text-sm font-bold shadow-md shadow-teal-500/20"
                onClick={() => { setWarning(false); submit(answersRef.current) }}
                disabled={pending}
              >
                {pending ? "جارٍ التسليم..." : "تأكيد التسليم"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Questions Scroll View */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-4 p-3.5 sm:p-6 pb-24">
          {questions.map((q, qi) => {
            const qid      = q._id ?? String(qi)
            const selected = answers[qid]
            return (
              <div
                key={qid}
                id={`q-card-${qid}`}
                className={cn(
                  "rounded-2xl sm:rounded-3xl border bg-card p-4 sm:p-5 space-y-3.5 shadow-xs transition-all",
                  selected
                    ? "border-teal-300 dark:border-teal-800/60 ring-1 ring-teal-500/10"
                    : "border-border/70"
                )}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className={cn(
                    "grid size-7 sm:size-8 shrink-0 place-items-center rounded-xl text-xs sm:text-sm font-bold mt-0.5 transition-colors",
                    selected
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {qi + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold leading-relaxed text-foreground break-words">{q.text}</p>
                  </div>
                  <span className="shrink-0 text-[10px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 rounded-lg px-2 py-0.5">
                    {q.points} {q.points === 1 ? "نقطة" : "نقاط"}
                  </span>
                </div>

                {/* Choices: Full width on mobile, no clipped padding */}
                <div className="grid gap-2 sm:ps-10">
                  {q.choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateAnswers((prev) => ({ ...prev, [qid]: c.id }))}
                      className={cn(
                        "flex items-start gap-3 rounded-xl sm:rounded-2xl border p-3 text-start transition-all active:scale-[0.99]",
                        selected === c.id
                          ? "border-teal-500 bg-teal-50/80 text-teal-900 font-medium shadow-xs dark:border-teal-600 dark:bg-teal-950/40 dark:text-teal-200"
                          : "border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border text-foreground"
                      )}
                    >
                      <span className={cn(
                        "grid size-6 sm:size-6.5 shrink-0 place-items-center rounded-lg text-xs font-bold border mt-0.5 transition-colors",
                        selected === c.id
                          ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                          : "bg-background border-border text-muted-foreground"
                      )}>
                        {c.id}
                      </span>
                      <span className="flex-1 text-xs sm:text-sm leading-relaxed pt-0.5 break-words">{c.text}</span>
                      {selected === c.id && <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Bottom Submit Action Bar */}
          <div className="pt-2 pb-6">
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 text-white hover:opacity-95 rounded-2xl h-12 text-sm sm:text-base font-bold shadow-md shadow-teal-500/20 active:scale-[0.99]"
              onClick={() => setWarning(true)}
              disabled={pending}
            >
              <Send className="size-4" />
              <span>{pending ? "جارٍ تسجيل الإجابات..." : `تسليم الامتحان (${answered}/${questions.length} سؤال)`}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
