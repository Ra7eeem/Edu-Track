"use server"

import { getGroupsByGradeApi } from "../apis/auth.api"
import type { PublicGroup } from "../types/auth"

export type { PublicGroup }

export async function fetchGroupsByGradeAction(grade: string): Promise<PublicGroup[]> {
  if (!grade) return []
  return getGroupsByGradeApi(grade)
}
