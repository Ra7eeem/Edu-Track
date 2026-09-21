"use client"

import { fetchStudentsByGrades } from "@/features/academic-stages/api/academic-stages.api"
import { Grade } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

/**
 * React Query hook that fetches all students belonging to the given grades.
 *
 * Query key is scoped by [stageId, academicYear] so that:
 *   - Different stages are cached independently.
 *   - Changing the academic year (UI label) results in a distinct cache entry,
 *     even though the backend request is identical. This future-proofs the hook
 *     if backend academic-year support is added later.
 *
 * staleTime: 2 minutes — student lists change infrequently within a session.
 */
export function useAcademicStageStudents(
  stageId: string,
  grades: Grade[],
  academicYear: string
) {
  return useQuery({
    queryKey: ["academic-stage-students", stageId, academicYear],
    queryFn:  () => fetchStudentsByGrades(grades),
    staleTime: 2 * 60 * 1000,
    // Don't fetch if no grades are configured for this stage
    enabled:  grades.length > 0,
  })
}
