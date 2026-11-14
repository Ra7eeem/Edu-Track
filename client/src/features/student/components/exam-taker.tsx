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
      if (!result.success) {
        setError(result.error || "فشل تسليم الامتحان")
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

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-card px-4 py-3 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{assignment.title}</p>
          <p className="text-xs text-muted-foreground">{answered}/{questions.length} سؤال مُجاب</p>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-sm font-bold tabular-nums",
          isRed   ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse" :
          isAmber ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400" :
                    "border-border/60 bg-muted/40 text-foreground"
        )}>
          <Clock className="size-3.5" />
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>

        <Button
          size="sm"
          className="bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90 shrink-0"
          onClick={() => submit(answersRef.current)}
          disabled={pending}
        >
          <Send className="size-3.5" />
          {pending ? "جارٍ التسليم..." : "تسليم"}
        </Button>
      </div>

      <div className="h-1 shrink-0 bg-muted">
        <div
          className={cn("h-full transition-all duration-1000", isRed ? "bg-rose-500" : isAmber ? "bg-amber-500" : "bg-teal-500")}
          style={{ width: `${pct}%` }}
        />
      </div>

      {warning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-border/60 bg-background p-6 shadow-2xl text-center">
            <AlertTriangle className="mx-auto mb-3 size-10 text-amber-500" />
            <h3 className="font-bold text-base">هل تريد تسليم الامتحان؟</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              لو خرجت دلوقتي هيتسلّم الامتحان تلقائياً بالإجابات الحالية.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setWarning(false)}>
                إكمال الامتحان
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90"
                onClick={() => { setWarning(false); submit(answersRef.current) }}
                disabled={pending}
              >
                تسليم الآن
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

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-5 p-4 sm:p-6">
          {questions.map((q, qi) => {
            const qid      = q._id ?? String(qi)
            const selected = answers[qid]
            return (
              <div key={qid} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-xl text-xs font-bold mt-0.5",
                    selected ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "bg-muted text-muted-foreground"
                  )}>
                    {qi + 1}
                  </span>
                  <p className="flex-1 text-sm font-medium leading-snug">{q.text}</p>
                  <span className="shrink-0 text-[10px] font-bold text-amber-600">{q.points} نقطة</span>
                </div>

                <div className="grid gap-2 ps-10">
                  {q.choices.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateAnswers((prev) => ({ ...prev, [qid]: c.id }))}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm text-start transition-all",
                        selected === c.id
                          ? "border-teal-500 bg-teal-50 text-teal-700 font-medium dark:border-teal-700 dark:bg-teal-950/30 dark:text-teal-300"
                          : "border-border/50 bg-muted/20 hover:bg-muted hover:border-border"
                      )}
                    >
                      <span className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-lg text-xs font-bold border",
                        selected === c.id ? "bg-teal-600 text-white border-teal-600" : "bg-card border-border"
                      )}>
                        {c.id}
                      </span>
                      <span className="flex-1">{c.text}</span>
                      {selected === c.id && <CheckCircle2 className="size-4 text-teal-600 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
