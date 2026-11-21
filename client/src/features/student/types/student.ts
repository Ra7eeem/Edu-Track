/**
 * Student Feature Types & DTOs
 * Follows Rose-App feature typing conventions
 */
import {
  ApiAssignment,
  ApiComment,
  ApiGroup,
  ApiPost,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"

export interface StudentRankEntry {
  month: number
  year: number
  studentId: string
  rank: number
  score: number
  presentCount: number
  absentCount: number
  totalMembers: number
  pointsToNextRank?: number
}

export interface StudentDashboardData {
  student: ApiUser
  groups: ApiGroup[]
  notifications: { isRead: boolean }[]
  unreadCount: number
  firstGroup: (ApiGroup & { _id?: string; id?: string }) | null
  posts: ApiPost[]
  rank: StudentRankEntry | null
  top3?: {
    rank: number
    studentId: string
    name: string
    avatarUrl?: string
    grade?: string
    score: number
  }[]
  myTeam?: {
    _id: string
    name: string
    currentCycleScore: number
    totalScore: number
    teamRank: number
    totalTeams: number
  } | null
  todayQuestion?: {
    questionId: string
    rewardPoints: number
    alreadyAnswered: boolean
    isCorrect?: boolean | null
  } | null
}

export interface StudentAttendanceRecord {
  date: string
  status: "PRESENT" | "ABSENT" | "LATE"
}

export interface SubmitExamAnswer {
  questionId: string
  chosen: string
}

export interface SubmitExamInput {
  assignmentId: string
  groupId?: string
  answers: SubmitExamAnswer[]
}

export interface SendAnonymousMessageInput {
  groupId: string
  teacherId: string
  content: string
}

export type StudentActionResult = {
  success: boolean
  message?: string
  data?: unknown
  error?: string
}

