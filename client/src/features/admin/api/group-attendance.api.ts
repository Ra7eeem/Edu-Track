/**
 * Group Attendance API — client-side fetch functions.
 *
 * The backend has no pre-aggregated "attendance percentage" endpoint.
 * We compute percentages from raw session data returned by:
 *   GET /api/admin/groups/:groupId/attendance?month=M&year=Y
 *
 * Architecture:
 *   GroupGrid (UI) → useGroup*Attendance hook → this API → clientFetch → backend
 */
import { clientFetch } from "@/shared/lib/api-client"
import { ApiAttendanceSession, AttendanceStatus, PaginatedResponse } from "@/shared/types/api"

// ─── Helper ───────────────────────────────────────────────────────────────────
function toArray<T>(raw: PaginatedResponse<T> | T[] | unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data))  return r.data  as T[]
  if (Array.isArray(r.docs))  return r.docs  as T[]
  if (Array.isArray(r.items)) return r.items as T[]
  return []
}

/**
 * Computes attendance percentage from an array of session records.
 * Returns null when there are no records (no sessions yet taken).
 */
function computePercent(sessions: ApiAttendanceSession[]): number | null {
  let present = 0
  let total   = 0

  for (const session of sessions) {
    for (const record of session.records) {
      total++
      if (record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE) {
        // Count LATE as present for the attendance percentage
        // (consistent with how the ranking system treats attendance)
        present++
      }
    }
  }

  if (total === 0) return null
  return Math.round((present / total) * 100)
}

// ─── Overall Attendance ───────────────────────────────────────────────────────
/**
 * Fetches this month's attendance sessions for a group and computes
 * an overall attendance percentage.
 *
 * Using current month as a proxy for "overall" is pragmatic:
 * the admin sees a snapshot of recent attendance, which is the most
 * actionable data. A full historical aggregate would require N queries.
 */
export async function fetchGroupOverallAttendance(
  groupId: string
): Promise<number | null> {
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const raw = await clientFetch<PaginatedResponse<ApiAttendanceSession> | ApiAttendanceSession[]>(
    `/api/admin/groups/${groupId}/attendance?month=${month}&year=${year}&limit=100`
  )

  const sessions = toArray<ApiAttendanceSession>(raw)
  return computePercent(sessions)
}

// ─── Today's Attendance ───────────────────────────────────────────────────────
/**
 * Fetches this month's attendance sessions, finds today's session,
 * and returns today's attendance percentage.
 * Returns null if no session has been taken today.
 */
export async function fetchGroupTodayAttendance(
  groupId: string
): Promise<number | null> {
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  // Today's date in YYYY-MM-DD (UTC) for comparison
  const todayKey = now.toISOString().split("T")[0]

  const raw = await clientFetch<PaginatedResponse<ApiAttendanceSession> | ApiAttendanceSession[]>(
    `/api/admin/groups/${groupId}/attendance?month=${month}&year=${year}&limit=100`
  )

  const sessions = toArray<ApiAttendanceSession>(raw)

  // Find today's session specifically
  const todaySession = sessions.find((s) => {
    const sessionDate = new Date(s.date).toISOString().split("T")[0]
    return sessionDate === todayKey
  })

  if (!todaySession) return null
  return computePercent([todaySession])
}
