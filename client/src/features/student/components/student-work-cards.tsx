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
  const aid = resolveId(assignment)
  const submitted = Boolean(assignment.mySubmission?.submitted)
  const availability = getExamAvailability(assignment)
  const showResults = canShowExamResults(assignment, assignment.mySubmission?.score)
  const score = assignment.mySubmission?.score
  const total = assignment.mySubmission?.total ?? 1
  const questionCount = assignment.questionCount ?? assignment.questions?.length ?? 0

  return (
    <article className="rounded-2xl sm:rounded-3xl border border-rose-200/70 bg-card p-4 sm:p-5 shadow-sm space-y-3.5 transition-all hover:border-rose-300 dark:border-rose-800/40">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 text-xl shadow-sm dark:from-rose-950/40 dark:to-rose-900/20 border border-rose-200/50 dark:border-rose-800/30">
          📝
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-[11px] rounded-full px-2.5 py-0.5 font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/30">
              امتحان
            </span>
            {assignment.durationMinutes && (
              <span className="flex items-center gap-1 text-[11px] rounded-full px-2.5 py-0.5 bg-amber-100 text-amber-800 font-bold dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/30">
                <Clock className="size-3" />
                {assignment.durationMinutes} دقيقة
              </span>
            )}
            {questionCount > 0 && (
              <span className="text-[11px] rounded-full px-2.5 py-0.5 bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary border border-primary/30">
                {questionCount} سؤال
              </span>
            )}
            {submitted && (
              <span className="flex items-center gap-1 text-[11px] rounded-full px-2.5 py-0.5 font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/30">
                <CheckCircle2 className="size-3" />
                تم التسليم
              </span>
            )}
            {availability.notYet && (
              <span className="text-[11px] rounded-full px-2.5 py-0.5 font-bold bg-accent/10 text-accent font-bold border border-accent/20">
                يبدأ {availability.fromLabel}
              </span>
            )}
            {availability.expired && !submitted && (
              <span className="text-[11px] rounded-full px-2.5 py-0.5 font-bold bg-muted text-muted-foreground border border-border/50">
                انتهى وقت الامتحان
              </span>
            )}
          </div>
          <h3 className="font-bold text-base sm:text-lg leading-snug text-foreground break-words">{assignment.title}</h3>
        </div>
      </div>

      {assignment.description && (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-3 bg-muted/20 rounded-xl p-2.5 border border-border/30">
          {assignment.description}
        </p>
      )}

      {/* Timing and Dates info */}
      {(assignment.availableFrom || assignment.availableTo || assignment.dueDate) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
          {assignment.availableFrom && (
            <span className="flex items-center gap-1">
              <span>📅 البدء:</span>
              <span className="font-semibold text-foreground">
                {new Date(assignment.availableFrom).toLocaleDateString("ar-EG", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </span>
          )}
          {(assignment.availableTo || assignment.dueDate) && (
            <span className="flex items-center gap-1">
              <span>⌛ النهاية:</span>
              <span className={cn("font-semibold", availability.expired ? "text-rose-600" : "text-foreground")}>
                {new Date(assignment.availableTo ?? assignment.dueDate!).toLocaleDateString("ar-EG", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </span>
          )}
        </div>
      )}

      {submitted && (
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3.5 sm:p-4 dark:border-emerald-800/40 dark:bg-emerald-950/20">
          {showResults ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                  درجتك: {score} / {assignment.mySubmission?.total}
                </p>
                <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                  {Math.round(((score ?? 0) / Math.max(total, 1)) * 100)}٪
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">تم التسليم — فرصة واحدة فقط</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">تم تسليم الامتحان بنجاح</p>
                <p className="text-[10px] text-muted-foreground">سيُعلن المدرس عن النتائج لاحقاً</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      <div>
        {submitted ? (
          <Button asChild size="lg" variant="outline" className="w-full rounded-xl border-border/80 h-11 text-xs sm:text-sm font-semibold">
            <Link href={`/student/exams/${aid}/results`}>
              📊 عرض تفاصيل النتيجة
            </Link>
          </Button>
        ) : availability.available && questionCount > 0 ? (
          <Button asChild size="lg" className="w-full rounded-xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/20 hover:opacity-95 h-11 text-sm font-bold transition-all active:scale-[0.99]">
            <Link href={`/student/exams/${aid}`}>
              📝 ابدأ الامتحان الآن
            </Link>
          </Button>
        ) : availability.notYet ? (
          <Button disabled size="lg" variant="secondary" className="w-full rounded-xl h-11 text-xs sm:text-sm font-medium opacity-80 cursor-not-allowed">
            🔒 يبدأ الامتحان {availability.fromLabel}
          </Button>
        ) : availability.expired ? (
          <Button disabled size="lg" variant="ghost" className="w-full rounded-xl h-11 text-xs sm:text-sm font-medium text-muted-foreground cursor-not-allowed border border-dashed">
            انتهى وقت هذا الامتحان
          </Button>
        ) : null}
      </div>
    </article>
  )
}

