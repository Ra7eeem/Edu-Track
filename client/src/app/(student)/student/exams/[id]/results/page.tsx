import { RefreshOnInterval } from "@/features/student/components/refresh-on-interval"
import { canShowExamResults } from "@/features/student/lib/exam-availability"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/tailwind-cn"
import { serverFetch } from "@/shared/lib/api-server"
import { ApiAssignment, ApiExamSubmission } from "@/shared/types/api"
import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function ExamResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [assignment, submission] = await Promise.all([
    serverFetch<ApiAssignment>(`/api/assignments/${id}`),
    serverFetch<ApiExamSubmission | null>(`/api/assignments/${id}/my-submission`),
  ])

  if (!submission) {
    redirect(`/student/exams/${id}`)
  }

  const score   = submission.score
  const total   = submission.total ?? 0
  const canShow = canShowExamResults(assignment, score) && submission.showResults !== false
  const pct     = canShow && total ? Math.round((score! / total) * 100) : 0
  const pass    = pct >= 50
  const answers = submission.answersWithDetails ?? submission.answers ?? []

  return (
    <div className="mx-auto w-full max-w-2xl p-3.5 sm:p-6 space-y-4 sm:space-y-5">
      <RefreshOnInterval seconds={30} />

      <div className={cn(
        "rounded-3xl border p-6 sm:p-8 text-center shadow-xs transition-all",
        canShow
          ? pass
            ? "border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20"
            : "border-rose-200/80 bg-rose-50/60 dark:border-rose-800/40 dark:bg-rose-950/20"
          : "border-border/60 bg-muted/20"
      )}>
        {canShow ? (
          <>
            {pass
              ? <CheckCircle2 className="mx-auto mb-3 size-12 sm:size-14 text-emerald-500" />
              : <XCircle className="mx-auto mb-3 size-12 sm:size-14 text-rose-500" />
            }
            <p className="text-3xl sm:text-4xl font-black text-foreground">
              {score} <span className="text-base sm:text-lg font-bold text-muted-foreground">/ {total}</span>
            </p>
            <p className="mt-1 text-lg sm:text-xl font-bold" style={{ color: pass ? "#059669" : "#e11d48" }}>
              {pct}٪ — {pass ? "ناجح ومتميز 🎉" : "راجع المادة واستعد للامتحان القادم"}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex size-12 sm:size-14 items-center justify-center rounded-2xl bg-muted/60">
              <span className="text-2xl sm:text-3xl">📊</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-foreground">تم تسليم الامتحان بنجاح</p>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
              سيُعلن المدرس عن النتائج لاحقاً
            </p>
          </>
        )}
        <p className="mt-3 text-xs sm:text-sm font-medium text-muted-foreground bg-card/60 inline-block px-3 py-1 rounded-full border border-border/40">
          {assignment.title}
        </p>
      </div>

      {canShow && answers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground">مراجعة إجاباتك</h3>
          {answers.map((ans, i) => (
            <div key={ans.questionId} className="rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 space-y-2.5 shadow-xs">
              <div className="flex items-start gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-muted text-[11px] font-bold mt-0.5">{i + 1}</span>
                <p className="flex-1 text-xs sm:text-sm font-medium leading-relaxed text-foreground break-words">{ans.questionText ?? `سؤال ${i + 1}`}</p>
                {ans.isCorrect === true  && <CheckCircle2 className="size-4 sm:size-5 text-emerald-500 shrink-0 mt-0.5" />}
                {ans.isCorrect === false && <XCircle className="size-4 sm:size-5 text-rose-500 shrink-0 mt-0.5" />}
              </div>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className={cn(
                  "rounded-xl border px-2.5 py-1 font-medium",
                  ans.isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300"
                )}>
                  إجابتك: <strong className="font-bold">{ans.chosen}</strong>
                </span>
                {!ans.isCorrect && ans.correctAnswer && (
                  <span className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-emerald-800 font-medium dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
                    الإجابة الصحيحة: <strong className="font-bold">{ans.correctAnswer}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button asChild size="lg" className="w-full rounded-2xl h-11 text-sm font-bold">
        <Link href="/student/exams">العودة إلى الامتحانات</Link>
      </Button>
    </div>
  )
}
