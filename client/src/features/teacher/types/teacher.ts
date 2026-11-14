import {
  ApiAssignment,
  ApiGroup,
  ApiNotification,
  ApiStudentNote,
  ApiUser,
  AttendanceStatus,
} from "@/shared/types/api"

export interface TeacherDashboardData {
  groups:        ApiGroup[]
  notifications: (ApiNotification & { isRead: boolean })[]
  unreadCount:   number
  todayPresent:  number
  todayAbsent:   number
}

export type GroupStudent = Pick<
  ApiUser,
  "_id" | "id" | "name" | "email" | "avatarUrl" | "grade" | "phone"
>

export interface GroupDetails {
  group: ApiGroup
  teachers: unknown[]
  studentsCount: number
}

export interface StudentProfileData {
  student:           ApiUser
  scores:            {
    month: number
    year: number
    score: number
    presentCount: number
    lateCount: number
    absentCount: number
    bonusPoints: number
  }[]
  notes:             ApiStudentNote[]
  attendanceRecords: { date: string; status: AttendanceStatus }[]
}

export interface TeacherActionResult<T = unknown> {
  success?: boolean
  error?: string
  data?: T
}

