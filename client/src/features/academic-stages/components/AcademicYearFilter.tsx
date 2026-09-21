"use client"

import { getAcademicYearOptions } from "@/features/academic-stages/config/academic-stages.config"
import { ChevronDown } from "lucide-react"
import { useId } from "react"

interface AcademicYearFilterProps {
  value:    string
  onChange: (year: string) => void
}

/**
 * Dropdown for selecting an academic year.
 *
 * The academic year filter is UI-level: the backend does not store an
 * "academic year" field on students. The selected year is used as a cache
 * key in the React Query hook so each year's data is cached independently,
 * and the UI communicates which enrollment cohort is being viewed.
 */
export function AcademicYearFilter({ value, onChange }: AcademicYearFilterProps) {
  const options = getAcademicYearOptions()
  const id      = useId()

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="text-xs font-medium text-muted-foreground whitespace-nowrap"
      >
        السنة الدراسية
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 appearance-none rounded-xl border border-border bg-background pe-7 ps-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          aria-label="اختر السنة الدراسية"
        >
          {options.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </div>
  )
}
