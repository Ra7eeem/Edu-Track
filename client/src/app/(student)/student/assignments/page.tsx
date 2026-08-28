"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiGroup, ApiQuestion,
  AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Clock, ExternalLink } from "lucide-react"
import { useState } from "react"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

// ─── Assignment Card ──────────────────────────────────────────────────────────
function AssignmentCard({ assignment: a }: { assignment: ApiAssignment }) {
  const [open, setOpen] = useState(false)
  const aid    = resolveId(a as { _id?: string; id?: string })
  const isExam = a.type === AssignmentType.EXAM
  const isPast = a.dueDate ? new Date(a.dueDate) < new Date() : false
  const daysLeft = a.dueDate
    ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000)
    : null
  const questions: ApiQuestion[] = a.questions ?? []
  const totalPoints = questions.reduce((s, q) => s + (q.points ?? 1), 0)

  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden",
      isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60")}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className={cn("grid size-10 place-items-center rounded-xl shrink-0 text-lg",
            isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-violet-100 dark:bg-violet-900/30")}>
            {isExam ? "📝" : "📚"}
          </span>
          <div className="min-w-0 flex-1">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={cn("text-[10px] rounded-full px-2 py-0.5 font-bold",
                isExam ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                       : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400")}>
                {ASSIGNMENT_TYPE_LABELS[a.type]}
              </span>
              {a.durationMinutes && (
                <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                  <Clock className="size-2.5" />{a.durationMinutes} دقيقة
                </span>
              )}
              {questions.length > 0 && (
                <span className="text-[10px] rounded-full px-2 py-0.5 bg-violet-100 text-violet-700 font-bold dark:bg-violet-900/30 dark:text-violet-400">
                  {questions.length} سؤال · {totalPoints} نقطة
                </span>
              )}
              {daysLeft !== null && !isPast && daysLeft <= 3 && (
                <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  {daysLeft === 0 ? "اليوم!" : `${daysLeft} أيام`}
                </span>
              )}
              {isPast && (
                <span className="text-[10px] rounded-full px-2 py-0.5 font-bold bg-slate-100 text-slate-500 dark:bg-slate-800">
                  منتهي
                </span>
              )}
            </div>
            <p className="font-bold text-sm">{a.title}</p>
          </div>

          {/* Expand questions toggle */}
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
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{a.description}</p>
        )}

        {/* YouTube */}
        {a.youtubeUrl && (
          <a href={a.youtubeUrl} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/40 px-3 py-2.5 text-xs text-rose-700 hover:bg-rose-50 transition-colors dark:border-rose-800/30 dark:bg-rose-950/10 dark:text-rose-400">
            <span className="text-base">▶️</span>
            <span className="flex-1 truncate">مشاهدة فيديو الشرح</span>
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        )}

        {a.dueDate && (
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
            📅 موعد التسليم:{" "}
            <span className={cn("font-medium", isPast ? "text-rose-600" : "text-foreground")}>
              {new Date(a.dueDate).toLocaleDateString("ar-EG", {
                weekday: "short", year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </p>
        )}
      </div>

      {/* Questions — student sees questions WITHOUT correct answers */}
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

          {questions.map((q, qi) => (
            <div key={q._id ?? qi} className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
              <div className="flex items-start gap-2">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 mt-0.5">
                  {qi + 1}
                </span>
                <p className="text-sm font-medium leading-snug flex-1">{q.text}</p>
                <span className="shrink-0 text-[10px] text-amber-600 font-bold">{q.points} نقطة</span>
              </div>

              <div className="grid grid-cols-1 gap-2 ps-8">
                {q.choices.map(c => (
                  <div key={c.id}
                    className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/40 px-3 py-2.5 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-card border border-border text-xs font-bold">
                      {c.id}
                    </span>
                    <span>{c.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StudentAssignmentsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  const { data: groupsRaw } = useQuery({
    queryKey: ["student", "groups"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiGroup>>("/api/students/me/groups?limit=20"),
  })
  const groups = toArray<ApiGroup>(groupsRaw)
  const activeGroupId = selectedGroupId ?? resolveId(groups[0] as { _id?: string; id?: string } | undefined ?? {})

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["assignments", activeGroupId],
    queryFn:  () => clientFetch<PaginatedResponse<ApiAssignment>>(`/api/assignments/group/${activeGroupId}?limit=50`),
    enabled:  !!activeGroupId,
  })
  const assignments = toArray<ApiAssignment>(rawData)

  const now      = new Date()
  const upcoming = assignments.filter(a => !a.dueDate || new Date(a.dueDate) >= now)
  const past     = assignments.filter(a =>  a.dueDate  && new Date(a.dueDate)  < now)

  return (
    <div className="flex flex-col">
      <TopBar title="الواجبات والامتحانات" notifHref="/student/notifications"
        userName="" userAvatar="أ" userAvatarColor="bg-cyan-500" profileHref="/student/profile" />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
        {/* Group selector */}
        {groups.length > 1 && (
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card p-1">
            {groups.map(g => {
              const gid = resolveId(g as { _id?: string; id?: string })
              return (
                <button key={gid} onClick={() => setSelectedGroupId(gid)}
                  className={cn("shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                    activeGroupId === gid ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {g.name}
                </button>
              )
            })}
          </div>
        )}

        {isLoading ? (
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
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  القادمة ({upcoming.length})
                </h3>
                <div className="space-y-3">
                  {upcoming.map(a => <AssignmentCard key={resolveId(a as { _id?: string; id?: string })} assignment={a} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground opacity-60">
                  المنتهية ({past.length})
                </h3>
                <div className="space-y-3 opacity-70">
                  {past.map(a => <AssignmentCard key={resolveId(a as { _id?: string; id?: string })} assignment={a} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
