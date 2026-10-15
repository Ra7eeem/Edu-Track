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
  const score        = assignment.mySubmission?.score
  const total        = assignment.mySubmission?.total ?? 1
  const questionCount = assignment.questionCount ?? assignment.questions?.length ?? 0
  const pct          = total ? Math.round(((score ?? 0) / total) * 100) : 0

  const href = submitted
    ? `/student/exams/${aid}/results`
    : availability.available && questionCount > 0
      ? `/student/exams/${aid}`
      : undefined

  const CardContent = (
    <article
      className={cn(
        "group relative flex items-center justify-between gap-3.5 rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all shadow-xs",
        href
          ? "cursor-pointer hover:border-primary/50 hover:bg-card/90 active:scale-[0.99]"
          : "opacity-85",
        submitted
          ? "border-emerald-500/20 bg-card/70 dark:bg-card/50"
          : availability.available && questionCount > 0
            ? "border-teal-500/30 bg-card/85 dark:bg-card/60 hover:border-teal-500/50"
            : "border-border/60 bg-muted/20"
      )}
    >
      {/* Left side: Status / Score Pill (exactly like the screenshot) */}
      <div className="shrink-0 flex items-center gap-2">
        {submitted ? (
          <span
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-black shadow-xs",
              pct >= 50
                ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-rose-500/15 text-rose-600 border border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-400"
            )}
          >
            {pct}٪
          </span>
        ) : availability.available && questionCount > 0 ? (
          <span className="rounded-xl px-3 py-1.5 text-xs font-bold bg-teal-500/15 text-teal-600 border border-teal-500/30 dark:bg-teal-500/20 dark:text-teal-400 flex items-center gap-1.5 group-hover:bg-teal-600 group-hover:text-white transition-all">
            <span className="size-2 rounded-full bg-teal-500 animate-pulse group-hover:bg-white" />
            ابدأ الآن
          </span>
        ) : availability.notYet ? (
          <span className="rounded-xl px-2.5 py-1 text-[11px] font-bold bg-blue-500/15 text-blue-600 border border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400">
            يبدأ {availability.fromLabel}
          </span>
        ) : (
          <span className="rounded-xl px-2.5 py-1 text-[11px] font-bold bg-muted text-muted-foreground border border-border/50">
            انتهى
          </span>
        )}
      </div>

      {/* Right side: Full Exam Name & Subtitle */}
      <div className="min-w-0 flex-1 text-start">
        <h3 className="font-extrabold text-sm sm:text-base leading-snug text-foreground break-words group-hover:text-primary transition-colors">
          {assignment.title}
        </h3>

        {/* Subtitle / Details */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-muted-foreground">
          {submitted ? (
            <span className="font-bold text-foreground">
              ({pct}٪) {score} / {assignment.mySubmission?.total ?? total}
            </span>
          ) : (
            <>
              {questionCount > 0 && <span>{questionCount} سؤال</span>}
              {assignment.durationMinutes && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{assignment.durationMinutes} دقيقة</span>
                </>
              )}
              {(assignment.availableTo || assignment.dueDate) && (
                <>
                  <span className="opacity-40">·</span>
                  <span>
                    حتى{" "}
                    {new Date(assignment.availableTo ?? assignment.dueDate!).toLocaleDateString("ar-EG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )

  return href ? (
    <Link href={href} className="block no-underline">
      {CardContent}
    </Link>
  ) : (
    <div>{CardContent}</div>
  )
}
