"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAdminStudentProfile } from "../api/admin-students.api"

export function useAdminStudentProfile(studentId: string) {
  return useQuery({
    queryKey: ["admin", "student", studentId, "profile"],
    queryFn: () => fetchAdminStudentProfile(studentId),
    enabled: !!studentId,
    staleTime: 60 * 1000,
  })
}
