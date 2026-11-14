"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiUser, ApiGroup, PaginatedResponse, ApiRankingEntry } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"
import type { StudentAttendanceRecord, StudentRankEntry } from "../types/student"

/**
 * Hook for fetching current student profile.
 * Cached for 5 minutes; supports initialData from Server Component to avoid initial client request.
 */
export function useStudentMe(opts?: { initialData?: ApiUser }) {
  return useQuery({
    queryKey: ["student", "me"],
    queryFn: () => clientFetch<ApiUser>("/api/students/me"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    initialData: opts?.initialData,
  })
}

/**
 * Hook for fetching student's enrolled groups.
 * Cached for 5 minutes; supports initialData from Server Component.
 */
export function useStudentGroups(
  opts?: { initialData?: PaginatedResponse<ApiGroup> | ApiGroup[] }
) {
  return useQuery({
    queryKey: ["student", "groups"],
    queryFn: () => clientFetch<PaginatedResponse<ApiGroup>>("/api/students/me/groups"),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    initialData: opts?.initialData,
  })
}

/**
 * Hook for student score history.
 */
export function useStudentScore() {
  return useQuery({
    queryKey: ["student", "scores"],
    queryFn: () => clientFetch<unknown[]>("/api/students/me/scores"),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for student rank in a specific group.
 */
export function useStudentRank(groupId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["student", "rank", groupId, month, year],
    queryFn: () =>
      clientFetch<StudentRankEntry>(
        `/api/groups/${groupId}/ranking/students/me?month=${month}&year=${year}`
      ),
    enabled: !!groupId && month > 0 && year > 0,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for group general ranking list.
 */
export function useStudentGroupRanking(groupId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["groups", groupId, "ranking", month, year],
    queryFn: () =>
      clientFetch<ApiRankingEntry[] | { data: ApiRankingEntry[] }>(
        `/api/groups/${groupId}/ranking?month=${month}&year=${year}`
      ),
    enabled: !!groupId && month > 0 && year > 0,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook for student attendance history in a specific group.
 */
export function useStudentAttendance(groupId: string) {
  return useQuery({
    queryKey: ["student", "attendance", groupId],
    queryFn: () =>
      clientFetch<StudentAttendanceRecord[]>(`/api/students/me/groups/${groupId}/attendance`),
    enabled: !!groupId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
