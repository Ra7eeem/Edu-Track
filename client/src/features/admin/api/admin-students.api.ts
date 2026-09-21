import { clientFetch } from "@/shared/lib/api-client"
import { ApiUser, ApiGroup, ApiMonthlyScore, ApiExamSubmission, AttendanceStatus } from "@/shared/types/api"

export interface AdminStudentProfileData {
  student: ApiUser
  groups: ApiGroup[]
  scores: ApiMonthlyScore[]
  attendanceRecords: {
    date: string
    status: AttendanceStatus
    groupId: string
  }[]
  examSubmissions: (ApiExamSubmission & {
    assignment: {
      _id: string
      title: string
      type: string
      showResults: boolean
    }
  })[]
}

export async function fetchAdminStudentProfile(studentId: string): Promise<AdminStudentProfileData> {
  return clientFetch<AdminStudentProfileData>(`/api/admin/students/${studentId}`)
}
