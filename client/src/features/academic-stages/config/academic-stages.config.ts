import { Grade } from "@/shared/types/api"

// ─── Academic Stage Configuration ────────────────────────────────────────────
// Single source of truth for all stage-to-grade mappings.
// Used by the Academic Stages page and any component that needs to group students by stage.

export interface AcademicStageConfig {
  id: string
  name: string
  /** The grade enum values that belong to this stage */
  grades: Grade[]
  /** Optional short display label (overrides the grade label when a special name is needed) */
  shortName?: string
  /** Accent color class for the stage header strip */
  colorClass: string
}

/**
 * Ordered list of academic stages used in the Talaea system.
 * Grade 13 represents خريجو الطلائع — university-level students who have
 * graduated from Grade 12 and continue their journey with the platform.
 */
export const ACADEMIC_STAGES: AcademicStageConfig[] = [
  {
    id:         "primary-first",
    name:       "المرحلة الابتدائية الأولى",
    grades:     [Grade.GRADE_1, Grade.GRADE_2, Grade.GRADE_3],
    colorClass: "from-sky-500 to-sky-600",
  },
  {
    id:         "primary-second",
    name:       "المرحلة الابتدائية الثانية",
    grades:     [Grade.GRADE_4, Grade.GRADE_5, Grade.GRADE_6],
    colorClass: "from-primary to-accent",
  },
  {
    id:         "preparatory",
    name:       "المرحلة الإعدادية",
    grades:     [Grade.GRADE_7, Grade.GRADE_8],
    colorClass: "from-teal-500 to-teal-600",
  },
  {
    id:         "secondary-first",
    name:       "المرحلة الثانوية الأولى",
    grades:     [Grade.GRADE_9, Grade.GRADE_10, Grade.GRADE_11],
    colorClass: "from-amber-500 to-amber-600",
  },
  {
    id:         "secondary-final",
    name:       "المرحلة الثانوية الأخيرة",
    shortName:  "3 ثانوي",
    grades:     [Grade.GRADE_12],
    colorClass: "from-rose-500 to-rose-600",
  },
  {
    id:         "alumni",
    name:       "خريجو الطلائع",
    grades:     [Grade.GRADE_13],
    colorClass: "from-emerald-500 to-emerald-600",
  },
]

// ─── Academic Year Helpers ────────────────────────────────────────────────────
// Academic year in Egypt runs roughly Sep 1 → Aug 31.
// The year filter is UI-level only since the backend doesn't store academic year
// on student records. It serves as a display label for the current enrollment cohort.

/**
 * Returns the current academic year as a string, e.g., "2026 / 2027".
 * The new year starts in September.
 */
export function getCurrentAcademicYear(): string {
  const now   = new Date()
  const year  = now.getFullYear()
  const month = now.getMonth() + 1 // 1–12

  // If we're in Sep–Dec, the academic year is year/year+1
  // If we're in Jan–Aug, the academic year is (year-1)/year
  if (month >= 9) {
    return `${year} / ${year + 1}`
  }
  return `${year - 1} / ${year}`
}

/**
 * Generates a list of recent academic years for the year picker.
 * Returns [currentYear, currentYear-1, currentYear-2].
 */
export function getAcademicYearOptions(): string[] {
  const current = getCurrentAcademicYear()
  const [startStr] = current.split(" / ")
  const start = parseInt(startStr, 10)
  return [
    `${start} / ${start + 1}`,
    `${start - 1} / ${start}`,
    `${start - 2} / ${start - 1}`,
  ]
}

