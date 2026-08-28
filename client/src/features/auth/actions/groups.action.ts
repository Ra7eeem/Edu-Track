"use server"

import { serverFetch } from "@/shared/lib/api-server"

export interface PublicGroup {
  _id: string
  name: string
  grades: string[]
}

export async function fetchGroupsByGradeAction(grade: string): Promise<PublicGroup[]> {
  try {
    const res = await serverFetch<PublicGroup[] | { data: PublicGroup[] }>(
      `/api/auth/groups?grade=${encodeURIComponent(grade)}`
    )
    if (!res) return []
    if (Array.isArray(res)) return res
    if ("data" in (res as object) && Array.isArray((res as { data: PublicGroup[] }).data)) {
      return (res as { data: PublicGroup[] }).data
    }
    return []
  } catch {
    return []
  }
}
