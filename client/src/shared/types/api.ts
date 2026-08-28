// ─── Enums (mirror server exactly) ────────────────────────────────────────────

export enum Role {
  ADMIN   = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum Grade {
  GRADE_7  = "GRADE_7",
  GRADE_8  = "GRADE_8",
  GRADE_9  = "GRADE_9",
  GRADE_10 = "GRADE_10",
  GRADE_11 = "GRADE_11",
  GRADE_12 = "GRADE_12",
}

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.GRADE_7]:  "الصف الأول الإعدادي",
  [Grade.GRADE_8]:  "الصف الثاني الإعدادي",
  [Grade.GRADE_9]:  "الصف الثالث الإعدادي",
  [Grade.GRADE_10]: "الصف الأول الثانوي",
  [Grade.GRADE_11]: "الصف الثاني الثانوي",
  [Grade.GRADE_12]: "الصف الثالث الثانوي",
}

export enum JoinRequestStatus {
  PENDING  = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT  = "ABSENT",
}

export enum NotificationType {
  JOIN_REQUEST_APPROVED = "JOIN_REQUEST_APPROVED",
  JOIN_REQUEST_REJECTED = "JOIN_REQUEST_REJECTED",
  NEW_POST              = "NEW_POST",
  NEW_COMMENT           = "NEW_COMMENT",
  NEW_REPLY             = "NEW_REPLY",
  ADDED_TO_GROUP        = "ADDED_TO_GROUP",
}

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface ApiUser {
  id:        string
  name:      string
  email:     string
  role:      Role
  avatarUrl: string | null
  grade:     Grade | null
  phone:     string | null
  isActive:  boolean
  createdAt: string
  updatedAt: string
}

export interface ApiGroup {
  id:          string
  name:        string
  description: string | null
  imageUrl:    string | null
  isActive:    boolean
  createdById: string
  createdBy?:  Pick<ApiUser, "id" | "name" | "email">
  createdAt:   string
  updatedAt:   string
}

export interface ApiGroupTeacher {
  id:         string
  groupId:    string
  teacherId:  string
  teacher?:   Pick<ApiUser, "id" | "name" | "email" | "avatarUrl">
  assignedAt: string
}

export interface ApiGroupMembership {
  id:        string
  studentId: string
  groupId:   string
  student?:  Pick<ApiUser, "id" | "name" | "email" | "avatarUrl" | "grade">
  isActive:  boolean
  joinedAt:  string
}

export interface ApiJoinRequest {
  id:          string
  studentId:   string
  groupId:     string
  status:      JoinRequestStatus
  student?:    Pick<ApiUser, "id" | "name" | "email" | "avatarUrl" | "grade">
  group?:      Pick<ApiGroup, "id" | "name">
  reviewedAt:  string | null
  reviewedBy:  string | null
  createdAt:   string
  updatedAt:   string
}

export interface ApiAttendanceRecord {
  studentId: string
  status:    AttendanceStatus
  student?:  Pick<ApiUser, "id" | "name" | "avatarUrl">
}

export interface ApiAttendanceSession {
  id:        string
  groupId:   string
  date:      string        // "YYYY-MM-DD"
  createdBy: string
  records:   ApiAttendanceRecord[]
  createdAt: string
}

export interface ApiMonthlyScore {
  id:           string
  studentId:    string
  groupId:      string
  month:        number    // 1-12
  year:         number
  score:        number
  presentCount: number
  absentCount:  number
  student?:     Pick<ApiUser, "id" | "name" | "avatarUrl" | "grade">
}

export interface ApiRankingEntry {
  rank:         number
  score:        number
  presentCount: number
  absentCount:  number
  student:      Pick<ApiUser, "id" | "name" | "email" | "avatarUrl" | "grade">
}

export interface ApiPost {
  id:           string
  groupId:      string
  authorId:     string
  content:      string
  imageUrl:     string | null
  author?:      Pick<ApiUser, "id" | "name" | "avatarUrl">
  likeCount:    number
  commentCount: number
  isLiked:      boolean
  createdAt:    string
  updatedAt:    string
}

export interface ApiComment {
  id:              string
  postId:          string
  authorId:        string
  content:         string
  parentCommentId: string | null
  author?:         Pick<ApiUser, "id" | "name" | "avatarUrl">
  replies?:        ApiComment[]
  replyCount:      number
  createdAt:       string
  updatedAt:       string
}

export interface ApiNotification {
  id:        string
  userId:    string
  type:      NotificationType
  title:     string
  message:   string
  isRead:    boolean
  metadata:  Record<string, unknown> | null
  createdAt: string
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data:    T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  code?:   string
  errors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginationMeta {
  page:       number
  limit:      number
  total:      number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data:       T[]
  pagination: PaginationMeta
}

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export interface LoginResponse {
  token: string
  user:  Pick<ApiUser, "id" | "name" | "email" | "role" | "avatarUrl" | "grade" | "phone">
}

export interface RegisterStudentResponse {
  token: string
  user:  Pick<ApiUser, "id" | "name" | "email" | "role" | "grade" | "phone">
  joinRequest: {
    groupId:   string
    groupName: string
    status:    JoinRequestStatus
    message:   string
  }
}

// ─── Dashboard DTOs ───────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalTeachers: number
  totalStudents: number
  totalGroups:   number
  totalPosts:    number
  totalComments: number
  todayPresent:  number
  todayAbsent:   number
}

// ─── Session (stored in iron-session cookie) ─────────────────────────────────

export interface SessionData {
  token:  string
  userId: string
  role:   Role
  name:   string
  email:  string
  avatarUrl: string | null
  grade:  Grade | null
  isLoggedIn: boolean
}
