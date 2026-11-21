"use client"

import { ApiUser, GRADE_LABELS, Grade, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { AlertCircle, GraduationCap } from "lucide-react"
import Link from "next/link"

// ─── Grade badge color map ────────────────────────────────────────────────────
const GRADE_BADGE_COLORS: Partial<Record<Grade, string>> = {
  [Grade.GRADE_1]:  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  [Grade.GRADE_2]:  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  [Grade.GRADE_3]:  "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  [Grade.GRADE_4]:  "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  [Grade.GRADE_5]:  "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  [Grade.GRADE_6]:  "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  [Grade.GRADE_7]:  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  [Grade.GRADE_8]:  "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  [Grade.GRADE_9]:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [Grade.GRADE_10]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [Grade.GRADE_11]: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [Grade.GRADE_12]: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  [Grade.GRADE_13]: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
export function StudentsTableSkeleton() {
  return (
    <div className="space-y-2" aria-label="جاري التحميل">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3"
        >
          <Skeleton className="size-8 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-2.5 w-48" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface StudentsTableProps {
  students:  ApiUser[]
  isLoading: boolean
  isError:   boolean
}

export function StudentsTable({ students, isLoading, isError }: StudentsTableProps) {
  // Loading state
  if (isLoading) {
    return <StudentsTableSkeleton />
  }

  // Error state
  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/20 dark:text-rose-400"
      >
        <AlertCircle className="size-4 shrink-0" />
        <span>حدث خطأ أثناء تحميل بيانات الطلاب. يرجى المحاولة مجدداً.</span>
      </div>
    )
  }

  // Empty state
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
        <GraduationCap className="size-10 opacity-30" />
        <p className="text-sm">لا يوجد طلاب في هذه المرحلة</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5" role="list" aria-label={`قائمة الطلاب (${students.length})`}>
      {students.map((student) => {
        const id          = resolveId(student)
        const gradeLabel  = student.grade ? (GRADE_LABELS[student.grade] ?? student.grade) : null
        const badgeColor  = student.grade ? (GRADE_BADGE_COLORS[student.grade] ?? "bg-muted text-muted-foreground") : "bg-muted text-muted-foreground"
        const initials    = student.name.charAt(0)

        return (
          <div
            key={id || student.email}
            role="listitem"
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-2.5 transition-colors hover:bg-muted/30"
          >
            {/* Avatar */}
            <span
              className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary"
              aria-hidden
            >
              {initials}
            </span>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <Link 
                href={`/admin/students/${id || student.email}`} 
                className="truncate text-sm font-medium leading-tight hover:text-primary hover:underline transition-colors block w-fit"
              >
                {student.name}
              </Link>
              <p className="truncate text-xs text-muted-foreground">{student.email}</p>
            </div>

            {/* Grade badge */}
            {gradeLabel && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  badgeColor
                )}
              >
                {gradeLabel}
              </span>
            )}

            {/* Inactive indicator */}
            {!student.isActive && (
              <span
                className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                title="الحساب غير نشط"
              >
                غير نشط
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

