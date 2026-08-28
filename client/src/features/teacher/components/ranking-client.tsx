"use client"

import { useGroupRanking } from "@/features/teacher/hooks/use-group-ranking"
import { ApiRankingEntry } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"

const ARABIC_MONTHS = [
  "", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

interface Props {
  groupId:        string
  initialRanking: ApiRankingEntry[]
  currentMonth:   number
  currentYear:    number
}

export function RankingClient({ groupId, initialRanking, currentMonth, currentYear }: Props) {
  const { data } = useGroupRanking(groupId, currentMonth, currentYear)
  const ranking  = data?.ranking ?? initialRanking

  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <p className="text-4xl mb-3">🏆</p>
        <p className="font-medium">لا يوجد ترتيب بعد</p>
        <p className="mt-1 text-sm text-muted-foreground">سيظهر الترتيب بعد تسجيل الحضور</p>
      </div>
    )
  }

  const medals = ["🥇", "🥈", "🥉"]
  const top3   = ranking.slice(0, 3)
  const rest   = ranking.slice(3)

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <p className="mb-1 text-center text-lg font-extrabold">
        ترتيب {ARABIC_MONTHS[currentMonth]} {currentYear}
      </p>
      <p className="mb-6 text-center text-xs text-muted-foreground">{ranking.length} طالب</p>

      {/* Podium */}
      {top3.length >= 2 && (
        <div className="mb-6 grid grid-cols-3 items-end gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/10 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            if (!entry) return <div key={i} />
            const pos    = i === 0 ? 2 : i === 1 ? 1 : 3
            const heights = ["h-20", "h-28", "h-16"]
            const podColor = pos === 1
              ? "bg-gradient-to-t from-amber-400 to-amber-300"
              : pos === 2
              ? "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600"
              : "bg-gradient-to-t from-amber-700/60 to-amber-600/50"

            return (
              <div key={entry.student.id} className={cn("flex flex-col items-center gap-1", i === 1 && "-mt-3")}>
                <span className="text-xl">{medals[pos - 1]}</span>
                <span className="grid size-10 place-items-center rounded-2xl bg-white text-sm font-bold text-violet-600 shadow-sm dark:bg-card">
                  {entry.student.name[0]}
                </span>
                <p className="text-center text-[10px] font-semibold leading-tight">
                  {entry.student.name.split(" ")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground">{entry.score} نقطة</p>
                <div className={cn("w-full rounded-t-xl", heights[i], podColor)} />
              </div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-2">
        {ranking.map((entry) => (
          <div
            key={entry.student.id}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
              entry.rank <= 3
                ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10"
                : "border-border/60 bg-card"
            )}
          >
            <span className="w-7 text-center shrink-0">
              {entry.rank <= 3
                ? medals[entry.rank - 1]
                : <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>
              }
            </span>
            <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
              {entry.student.name[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.student.name}</p>
              <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
                  style={{ width: ranking[0] ? `${(entry.score / ranking[0].score) * 100}%` : "0%" }}
                />
              </div>
            </div>
            <div className="text-end shrink-0">
              <p className="text-sm font-bold text-primary">{entry.score}</p>
              <p className="text-[10px] text-muted-foreground">{entry.presentCount} حضور</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
