import { ApiAssignment } from "@/shared/types/api"

export type ExamAvailability = {
  notYet:    boolean
  expired:   boolean
  available: boolean
  fromLabel: string | null
}

export function getExamAvailability(assignment: ApiAssignment, now = new Date()): ExamAvailability {
  const availFrom = assignment.availableFrom ? new Date(assignment.availableFrom) : null
  const availTo   = assignment.availableTo   ? new Date(assignment.availableTo)   : null
  const notYet    = availFrom ? now < availFrom : false
  const expired   = availTo  ? now > availTo   : false

  return {
    notYet,
    expired,
    available: !notYet && !expired,
    fromLabel: availFrom
      ? availFrom.toLocaleString("ar-EG", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })
      : null,
  }
}

export function canShowExamResults(assignment: Pick<ApiAssignment, "showResults">, score?: number): boolean {
  return assignment.showResults !== false && typeof score === "number"
}
