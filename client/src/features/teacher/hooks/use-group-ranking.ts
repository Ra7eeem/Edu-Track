"use client"

import { clientFetch } from "@/shared/lib/api-client"
import { ApiRankingEntry } from "@/shared/types/api"
import { useQuery } from "@tanstack/react-query"

export interface RankingData {
  month: number
  year: number
  groupId: string
  ranking: ApiRankingEntry[]
}

export function useGroupRanking(
  groupId: string,
  month?: number,
  year?: number,
  opts?: { initialData?: RankingData }
) {
  const now = new Date()
  const m = month ?? now.getMonth() + 1
  const y = year ?? now.getFullYear()

  return useQuery({
    queryKey:    ["groups", groupId, "ranking", m, y],
    queryFn:     () => clientFetch<RankingData>(`/api/groups/${groupId}/ranking?month=${m}&year=${y}&limit=100`),
    enabled:     !!groupId,
    staleTime:   2 * 60 * 1000,
    initialData: opts?.initialData,
  })
}
