"use client"

import {
  fetchGroupOverallAttendance,
  fetchGroupTodayAttendance,
} from "@/features/admin/api/group-attendance.api"
import { useQuery } from "@tanstack/react-query"

/**
 * Fetches the current month's overall attendance percentage for a group.
 *
 * Query key: ["admin", "group", groupId, "attendance", "overall"]
 * staleTime: 5 minutes — overall attendance figures change slowly.
 *
 * Returns null when no sessions have been recorded for this month.
 */
export function useGroupOverallAttendance(groupId: string) {
  return useQuery({
    queryKey:  ["admin", "group", groupId, "attendance", "overall"],
    queryFn:   () => fetchGroupOverallAttendance(groupId),
    staleTime: 5 * 60 * 1000,
    enabled:   !!groupId,
    // Don't throw on error — the group card should degrade gracefully
    retry: 1,
  })
}

/**
 * Fetches today's attendance percentage for a group.
 *
 * Query key: ["admin", "group", groupId, "attendance", "today"]
 * staleTime: 2 minutes — today's data is more volatile.
 *
 * Returns null when no session has been taken today.
 */
export function useGroupTodayAttendance(groupId: string) {
  return useQuery({
    queryKey:  ["admin", "group", groupId, "attendance", "today"],
    queryFn:   () => fetchGroupTodayAttendance(groupId),
    staleTime: 2 * 60 * 1000,
    enabled:   !!groupId,
    retry: 1,
  })
}
