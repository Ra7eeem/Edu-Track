"use client"

import {
  useGroupOverallAttendance,
  useGroupTodayAttendance,
} from "@/features/admin/hooks/use-group-attendance"
import { cn } from "@/shared/lib/tailwind-cn"
import { Skeleton } from "@/shared/components/ui/skeleton"

// ─── Color / Status helpers ───────────────────────────────────────────────────

type AttendanceLevel = "good" | "medium" | "low" | "none"

/**
 * Derives the attendance level from a percentage value.
 *
 * Rules:
 *   > 70%  → good   (جيد)
 *   ≥ 50%  → medium (متوسط)
 *   < 50%  → low    (منخفض)
 *   null   → none   (no data)
 */
function getLevel(pct: number | null | undefined): AttendanceLevel {
  if (pct === null || pct === undefined) return "none"
  if (pct > 70) return "good"
  if (pct >= 50) return "medium"
  return "low"
}

const LEVEL_CONFIG = {
  good: {
    label:       "جيد",
    barClass:    "bg-emerald-500",
    textClass:   "text-emerald-700 dark:text-emerald-400",
    badgeClass:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  medium: {
    label:       "متوسط",
    barClass:    "bg-amber-500",
    textClass:   "text-amber-700 dark:text-amber-400",
    badgeClass:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  low: {
    label:       "منخفض",
    barClass:    "bg-rose-500",
    textClass:   "text-rose-700 dark:text-rose-400",
    badgeClass:  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
  none: {
    label:       "—",
    barClass:    "bg-muted",
    textClass:   "text-muted-foreground",
    badgeClass:  "bg-muted text-muted-foreground",
  },
} as const

// ─── Single attendance indicator ──────────────────────────────────────────────
interface AttendanceIndicatorProps {
  label:     string
  percent:   number | null | undefined
  isLoading: boolean
}

function AttendanceIndicator({ label, percent, isLoading }: AttendanceIndicatorProps) {
  if (isLoading) {
    return (
      <div className="space-y-1.5" aria-busy="true" aria-label="جاري التحميل">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-1 w-full rounded-full" />
      </div>
    )
  }

  const level  = getLevel(percent)
  const config = LEVEL_CONFIG[level]
  const displayPct = percent !== null && percent !== undefined ? `${percent}%` : "—"

  return (
    <div className="space-y-1">
      {/* Label */}
      <p className="text-[10px] font-medium text-muted-foreground leading-none">{label}</p>

      {/* Percentage + status badge */}
      <div className="flex items-center gap-1.5">
        <span className={cn("text-xs font-bold tabular-nums", config.textClass)}>
          {displayPct}
        </span>
        <span
          className={cn(
            "rounded-full px-1.5 py-px text-[9px] font-semibold leading-none",
            config.badgeClass
          )}
        >
          {config.label}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percent ?? 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${displayPct}`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", config.barClass)}
          style={{ width: `${percent ?? 0}%` }}
        />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface GroupAttendanceBadgesProps {
  groupId: string
}

/**
 * Attendance indicators for a group card on the Admin Groups page.
 * Shows overall (current month) and today's attendance percentages.
 *
 * Uses separate React Query hooks so each indicator caches independently
 * and one error doesn't block the other.
 */
export function GroupAttendanceBadges({ groupId }: GroupAttendanceBadgesProps) {
  const overall = useGroupOverallAttendance(groupId)
  const today   = useGroupTodayAttendance(groupId)

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-border/50 bg-muted/20 p-3">
      <AttendanceIndicator
        label="نسبة الحضور العامة"
        percent={overall.data}
        isLoading={overall.isLoading}
      />
      <AttendanceIndicator
        label="نسبة حضور اليوم"
        percent={today.data}
        isLoading={today.isLoading}
      />
    </div>
  )
}
