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
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-5">
      <RefreshOnInterval seconds={30} />

      <div className={cn(
        "rounded-3xl border p-8 text-center shadow-sm",
        canShow
          ? pass
            ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20"
            : "border-rose-200/60 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-950/20"
          : "border-border/60 bg-muted/30"
      )}>
        {canShow ? (
          <>
            {pass
              ? <CheckCircle2 className="mx-auto mb-3 size-14 text-emerald-500" />
              : <XCircle className="mx-auto mb-3 size-14 text-rose-500" />
            }
            <p className="text-4xl font-extrabold">
              {score} <span className="text-lg font-medium text-muted-foreground">/ {total}</span>
            </p>
            <p className="mt-1 text-xl font-bold" style={{ color: pass ? "#059669" : "#e11d48" }}>
              {pct}٪ — {pass ? "ناجح 🎉" : "راجع المادة وحاول من جديد"}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-muted">
              <span className="text-3xl">📊</span>
            </div>
            <p className="text-lg font-bold">تم تسليم الامتحان بنجاح</p>
            <p className="mt-2 text-sm text-muted-foreground">
              سيُعلن المدرس عن النتائج لاحقاً
            </p>
          </>
        )}
        <p className="mt-2 text-sm text-muted-foreground">{assignment.title}</p>
      </div>

      {canShow && answers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold">مراجعة الإجابات</h3>
          {answers.map((ans, i) => (
            <div key={ans.questionId} className="rounded-2xl border border-border/60 bg-card p-4 space-y-2 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-bold">{i + 1}</span>
                <p className="flex-1 text-xs font-medium">{ans.questionText ?? `سؤال ${i + 1}`}</p>
                {ans.isCorrect === true  && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                {ans.isCorrect === false && <XCircle className="size-4 text-rose-500 shrink-0" />}
              </div>
              <div className="flex flex-wrap gap-2 ps-8 text-[11px]">
                <span className={cn(
                  "rounded-lg border px-2 py-1",
                  ans.isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400"
                )}>
                  إجابتك: <strong>{ans.chosen}</strong>
                </span>
                {!ans.isCorrect && ans.correctAnswer && (
                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                    الصحيحة: <strong>{ans.correctAnswer}</strong>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button asChild className="w-full">
        <Link href="/student/exams">العودة إلى الامتحانات</Link>
      </Button>
    </div>
  )
}
