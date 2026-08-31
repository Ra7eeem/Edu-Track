"use client"

import { AttendanceStatus } from "@/shared/types/api"
import { useEffect, useState, useCallback } from "react"

export interface PendingAttendance {
  id:        string   // local uuid
  groupId:   string
  date:      string
  records:   { studentId: string; status: AttendanceStatus }[]
  savedAt:   number   // timestamp
}

const QUEUE_KEY = "edu_pending_attendance"

function getQueue(): PendingAttendance[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]")
  } catch { return [] }
}

function saveQueue(q: PendingAttendance[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

function uuid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function useOfflineAttendance() {
  const [isOnline,  setIsOnline]  = useState(true)
  const [pending,   setPending]   = useState<PendingAttendance[]>([])
  const [syncing,   setSyncing]   = useState(false)
  const [lastSync,  setLastSync]  = useState<Date | null>(null)

  // Sync on mount + listen
  useEffect(() => {
    setIsOnline(navigator.onLine)
    setPending(getQueue())

    const onOnline  = () => { setIsOnline(true);  syncQueue() }
    const onOffline = () => { setIsOnline(false) }

    window.addEventListener("online",  onOnline)
    window.addEventListener("offline", onOffline)
    return () => {
      window.removeEventListener("online",  onOnline)
      window.removeEventListener("offline", onOffline)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const syncQueue = useCallback(async () => {
    const queue = getQueue()
    if (!queue.length || !navigator.onLine) return
    setSyncing(true)

    const failed: PendingAttendance[] = []
    for (const item of queue) {
      try {
        const { clientFetch } = await import("@/shared/lib/api-client")
        await clientFetch(`/api/groups/${item.groupId}/attendance`, {
          method: "POST",
          data:   { date: item.date, records: item.records },
        } as never)
      } catch {
        failed.push(item)   // keep failed ones
      }
    }

    saveQueue(failed)
    setPending(failed)
    setSyncing(false)
    setLastSync(new Date())
  }, [])

  /** Queue a record for offline saving (or send immediately if online) */
  const saveAttendance = useCallback(async (
    groupId: string,
    date:    string,
    records: { studentId: string; status: AttendanceStatus }[]
  ): Promise<{ success: boolean; offline: boolean; error?: string }> => {
    if (navigator.onLine) {
      try {
        const { saveAttendanceAction } = await import("@/features/teacher/actions/attendance.action")
        const res = await saveAttendanceAction(groupId, date, records)
        if (res.success) {
          setLastSync(new Date())
          return { success: true, offline: false }
        }
        return { success: false, offline: false, error: res.error }
      } catch (e) {
        // Fallthrough to offline queue
      }
    }
    // Offline — queue it
    const item: PendingAttendance = { id: uuid(), groupId, date, records, savedAt: Date.now() }
    const queue = getQueue()
    // Replace any existing queue entry for same group+date
    const filtered = queue.filter(q => !(q.groupId === groupId && q.date === date))
    const updated  = [...filtered, item]
    saveQueue(updated)
    setPending(updated)
    return { success: true, offline: true }
  }, [])

  return { isOnline, pending, syncing, lastSync, saveAttendance, syncQueue }
}
