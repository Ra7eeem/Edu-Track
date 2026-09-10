import { canShowExamResults, getExamAvailability } from "@/features/student/lib/exam-availability"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/tailwind-cn"
import { ApiAssignment, resolveId } from "@/shared/types/api"
import { CheckCircle2, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"

export function HomeworkCard({ assignment }: { assignment: ApiAssignment }) {
  const isPast = assignment.dueDate ? new Date(assignment.dueDate) < new Date() : false

  return (
    <article className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-2">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-xl shrink-0 bg-teal-100 text-lg dark:bg-teal-900/30">📚</span>
        <div className="min-w-0 flex-1">
          {isPast && (
            <span className="mb-1 inline-block text-[10px] rounded-full px-2 py-0.5 font-bold bg-muted text-muted-foreground">منتهي</span>
          )}
          <p className="font-bold text-sm">{assignment.title}</p>
        </div>
      </div>

      {assignment.description && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{assignment.description}</p>
      )}
      {assignment.youtubeUrl && (
        <a
          href={assignment.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/40 px-3 py-2.5 text-xs text-rose-700 hover:bg-rose-50 transition-colors dark:border-rose-800/30 dark:bg-rose-950/10 dark:text-rose-400"
        >
          <span className="text-base">▶️</span>
          <span className="flex-1 truncate">مشاهدة فيديو الشرح</span>
          <ExternalLink className="size-3.5 shrink-0" />
        </a>
      )}
      {assignment.dueDate && (
        <p className="text-xs text-muted-foreground">
          📅 موعد التسليم:{" "}
          <span className={cn("font-medium", isPast ? "text-rose-600" : "text-foreground")}>
            {new Date(assignment.dueDate).toLocaleDateString("ar-EG", {
              weekday: "short", year: "numeric", month: "short", day: "numeric",
            })}
          </span>
        </p>
      )}
    </article>
  )
}

export function ExamListCard({ assignment }: { assignment: ApiAssignment }) {
  const aid         = resolveId(assignment)
  const submitted    = Boolean(assignment.mySubmission?.submitted)
  const availability = getExamAvailability(assignment)
  const showResults  = canShowExamResults(assignment, assignment.mySubmission?.score)
  const score        = assignment.mySubmission?.score
  const total        = assignment.mySubmission?.total ?? 1

  return (
    <article className="rounded-2xl border border-rose-200/60 bg-card p-4 shadow-sm space-y-3 dark:border-rose-800/30">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-xl shrink-0 bg-rose-100 text-lg dark:bg-rose-900/30">📝</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5 mb-1">
            <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">امتحان</span>
            {assignment.durationMinutes && (
              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="size-2.5" />{assignment.durationMinutes} دقيقة
              </span>
            )}
            {submitted && (
              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="size-2.5" />تم التسليم
              </span>
            )}
            {availability.notYet && (
              <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                يبدأ {availability.fromLabel}
              </span>
            )}
            {availability.expired && !submitted && (
              <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-muted text-muted-foreground">انتهى وقت الامتحان</span>
            )}
          </div>
          <p className="font-bold text-sm">{assignment.title}</p>
        </div>
      </div>

      {assignment.description && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{assignment.description}</p>
      )}

      {submitted && (
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-4 py-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
          {showResults ? (
            <>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                درجتك: {score} / {assignment.mySubmission?.total}{" "}
                ({Math.round(((score ?? 0) / Math.max(total, 1)) * 100)}٪)
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">تم التسليم — فرصة واحدة فقط</p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">✓ تم التسليم</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">سيُعلن المدرس عن النتائج لاحقاً</p>
            </>
          )}
        </div>
      )}

      {submitted ? (
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={`/student/exams/${aid}/results`}>عرض حالة النتيجة</Link>
        </Button>
      ) : availability.available && (assignment.questionCount ?? assignment.questions?.length ?? 0) > 0 ? (
        <Button asChild size="sm" className="w-full bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90">
          <Link href={`/student/exams/${aid}`}>📝 ابدأ الامتحان الآن</Link>
        </Button>
      ) : null}
    </article>
  )
}
