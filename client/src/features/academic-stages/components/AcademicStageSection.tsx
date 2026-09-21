"use client"

import { AcademicStageConfig, getCurrentAcademicYear } from "@/features/academic-stages/config/academic-stages.config"
import { useAcademicStageStudents } from "@/features/academic-stages/hooks/use-academic-stage-students"
import { AcademicYearFilter } from "./AcademicYearFilter"
import { StudentsTable } from "./StudentsTable"
import { cn } from "@/shared/lib/tailwind-cn"
import { Users } from "lucide-react"
import { useState } from "react"

interface AcademicStageSectionProps {
  stage: AcademicStageConfig
}

/**
 * A card section for one academic stage.
 * Manages the academic year state locally (not lifted to page level)
 * so each stage has its own independent year filter.
 *
 * This is a Client Component because it needs:
 *   - useState for the selected academic year
 *   - React Query for client-side data fetching
 */
export function AcademicStageSection({ stage }: AcademicStageSectionProps) {
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear)

  const { data: students = [], isLoading, isError } = useAcademicStageStudents(
    stage.id,
    stage.grades,
    academicYear
  )

  const studentCount = isLoading ? null : students.length

  return (
    <section
      aria-labelledby={`stage-title-${stage.id}`}
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    >
      {/* Colored accent bar */}
      <div className={cn("h-1.5 bg-gradient-to-r", stage.colorClass)} aria-hidden />

      {/* Header */}
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
              stage.colorClass
            )}
            aria-hidden
          >
            <Users className="size-5" />
          </div>

          <div className="min-w-0">
            <h2
              id={`stage-title-${stage.id}`}
              className="truncate text-base font-bold leading-snug"
            >
              {stage.name}
            </h2>

            {studentCount !== null && (
              <p className="text-xs text-muted-foreground">
                {studentCount === 0
                  ? "لا يوجد طلاب"
                  : `${studentCount} طالب`}
              </p>
            )}
          </div>
        </div>

        {/* Academic year filter */}
        <div className="shrink-0">
          <AcademicYearFilter value={academicYear} onChange={setAcademicYear} />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 border-t border-border/50" />

      {/* Student list */}
      <div className="p-5">
        <StudentsTable
          students={students}
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </section>
  )
}
