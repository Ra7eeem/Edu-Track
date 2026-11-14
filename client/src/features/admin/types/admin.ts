import {
  AdminDashboardStats,
  ApiGroup,
  ApiMonthlyScore,
  ApiExamSubmission,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
  AttendanceStatus,
} from "@/shared/types/api"

export interface DashboardFull {
  stats:    AdminDashboardStats
  teachers: ApiUser[]
  groups:   ApiGroup[]
}

export interface AdminGroupDetail {
  group:         ApiGroup
  teachers:      ApiUser[]
  studentsCount: number
}

export interface AdminGroupRanking {
  month:   number
  year:    number
  groupId: string
  ranking: ApiRankingEntry[]
}

export interface AdminStudentProfileData {
  student: ApiUser
  groups:  ApiGroup[]
  scores:  ApiMonthlyScore[]
  attendanceRecords: {
    date:    string
    status:  AttendanceStatus
    groupId: string
  }[]
  examSubmissions: (ApiExamSubmission & {
    assignment: {
      _id:         string
      title:       string
      type:        string
      showResults: boolean
    }
  })[]
}

export interface AdminActionState {
  error?:   string
  success?: boolean
  message?: string
}

