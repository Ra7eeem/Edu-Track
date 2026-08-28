"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiGroup, AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink } from "lucide-react"
import { useState } from "react"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

export default function StudentAssignmentsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  // Load student's groups
  const { data: groupsRaw } = useQuery({
    queryKey: ["student", "groups"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiGroup>>("/api/students/me/groups?limit=20"),
  })
  const groups = toArray<ApiGroup>(groupsRaw)

  const activeGroupId = selectedGroupId ?? resolveId(groups[0])

  // Load assignments for selected group
  const { data: rawData, isLoading } = useQuery({
    queryKey: ["assignments", activeGroupId],
    queryFn:  () => clientFetch<PaginatedResponse<ApiAssignment>>(
      `/api/assignments/group/${activeGroupId}?limit=50`
    ),
    enabled: !!activeGroupId,
  })
  const assignments = toArray<ApiAssignment>(rawData)

  const now       = new Date()
  const upcoming  = assignments.filter(a => !a.dueDate || new Date(a.dueDate) >= now)
  const past      = assignments.filter(a =>  a.dueDate  && new Date(a.dueDate)  < now)

  return (
    <div className="flex flex-col">
      <TopBar
        title="الواجبات والامتحانات"
        notifHref="/student/notifications"
        userName=""
        userAvatar="أ"
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
        {/* Group selector */}
        {groups.length > 1 && (
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card p-1">
            {groups.map(g => {
              const gid = resolveId(g)
              return (
                <button
                  key={gid}
                  onClick={() => setSelectedGroupId(gid)}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                    activeGroupId === gid
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
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

function AssignmentCard({ assignment: a }: { assignment: ApiAssignment }) {
  const isExam   = a.type === AssignmentType.EXAM
  const isPast   = a.dueDate ? new Date(a.dueDate) < new Date() : false
  const daysLeft = a.dueDate
    ? Math.ceil((new Date(a.dueDate).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className={cn(
      "rounded-2xl border bg-card shadow-sm overflow-hidden",
      isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60"
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className={cn(
            "grid size-10 place-items-center rounded-xl shrink-0 text-lg",
            isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-violet-100 dark:bg-violet-900/30"
          )}>
            {isExam ? "📝" : "📚"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "text-[10px] rounded-full px-2 py-0.5 font-bold",
                isExam
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
              )}>
                {ASSIGNMENT_TYPE_LABELS[a.type]}
              </span>
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
            <p className="mt-1 font-bold text-sm">{a.title}</p>
          </div>
        </div>

        {a.description && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {a.description}
          </p>
        )}

        {/* YouTube embed preview */}
        {a.youtubeUrl && (
          <a
            href={a.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200/60 bg-rose-50/40 px-3 py-2.5 text-xs text-rose-700 hover:bg-rose-50 transition-colors dark:border-rose-800/30 dark:bg-rose-950/10 dark:text-rose-400"
          >
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
    </div>
  )
}
