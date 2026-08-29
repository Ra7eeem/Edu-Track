"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiUser, ApiGroup, PaginatedResponse, ApiRankingEntry } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

export function useStudentMe() {
  return useQuery({
    queryKey: ["student", "me"],
    queryFn:  () => clientFetch<ApiUser>("/api/students/me"),
    staleTime: 5 * 60 * 1000, // profile rarely changes
  })
}

export function useStudentGroups() {
  return useQuery({
    queryKey: ["student", "groups"],
    queryFn:  () => clientFetch<PaginatedResponse<ApiGroup>>("/api/students/me/groups"),
    staleTime: 5 * 60 * 1000,
  })
}

export function useStudentScore() {
  return useQuery({
    queryKey: ["student", "scores"],
    queryFn:  () => clientFetch<unknown[]>("/api/students/me/scores"),
    staleTime: 2 * 60 * 1000,
  })
}

export function useStudentRank(groupId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["student", "rank", groupId, month, year],
    queryFn:  () =>
      clientFetch<{
        month: number; year: number; studentId: string
        rank: number; score: number; presentCount: number; absentCount: number; totalMembers: number
      }>(`/api/groups/${groupId}/ranking/students/me?month=${month}&year=${year}`),
    enabled:   !!groupId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStudentAttendance(groupId: string) {
  return useQuery({
    queryKey: ["student", "attendance", groupId],
    queryFn:  () => clientFetch<unknown[]>(`/api/students/me/groups/${groupId}/attendance`),
    enabled:   !!groupId,
    staleTime: 2 * 60 * 1000,
  })
}
