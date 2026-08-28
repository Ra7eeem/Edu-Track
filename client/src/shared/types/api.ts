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
  LATE    = "LATE",
}

export enum NotificationType {
  JOIN_REQUEST_APPROVED = "JOIN_REQUEST_APPROVED",
  JOIN_REQUEST_REJECTED = "JOIN_REQUEST_REJECTED",
  NEW_POST              = "NEW_POST",
  NEW_COMMENT           = "NEW_COMMENT",
  NEW_REPLY             = "NEW_REPLY",
  ADDED_TO_GROUP        = "ADDED_TO_GROUP",
}

// ─── Helper: resolve id from MongoDB _id or id ───────────────────────────────
// MongoDB returns _id, Prisma/normalized returns id.
// Use this everywhere instead of directly accessing .id
export function resolveId(entity: { id?: string; _id?: string } | null | undefined): string {
  if (!entity) return ""
  return entity._id ?? entity.id ?? ""
}

export function resolveName(entity: { name?: string } | null | undefined): string {
  return entity?.name ?? ""
}

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface ApiUser {
  _id?:      string   // MongoDB
  id?:       string   // normalized
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
  _id?:        string   // MongoDB
  id?:         string   // normalized
  name:        string
  description: string | null
  imageUrl:    string | null
  isActive:    boolean
  createdById: string
  createdBy?:  Pick<ApiUser, "id" | "_id" | "name" | "email">
  createdAt:   string
  updatedAt:   string
}

export interface ApiGroupTeacher {
  _id?:       string
  id?:        string
  groupId:    string
  teacherId:  string
  teacher?:   Pick<ApiUser, "id" | "_id" | "name" | "email" | "avatarUrl">
  assignedAt: string
}

export interface ApiGroupMembership {
  _id?:      string
  id?:       string
  studentId: string
  groupId:   string
  student?:  Pick<ApiUser, "id" | "_id" | "name" | "email" | "avatarUrl" | "grade">
  isActive:  boolean
  joinedAt:  string
}

export interface ApiJoinRequest {
  _id?:        string
  id?:         string
  studentId:   string
  groupId:     string
  status:      JoinRequestStatus
  student?:    Pick<ApiUser, "id" | "_id" | "name" | "email" | "avatarUrl" | "grade">
  group?:      Pick<ApiGroup, "id" | "_id" | "name">
  reviewedAt:  string | null
  reviewedBy:  string | null
  createdAt:   string
  updatedAt:   string
}

export interface ApiAttendanceRecord {
  studentId: string
  status:    AttendanceStatus
  student?:  Pick<ApiUser, "id" | "_id" | "name" | "avatarUrl">
}

export interface ApiAttendanceSession {
  _id?:      string
  id?:       string
  groupId:   string
  date:      string
  createdBy: string
  records:   ApiAttendanceRecord[]
  createdAt: string
}

export interface ApiMonthlyScore {
  _id?:         string
  id?:          string
  studentId:    string
  groupId:      string
  month:        number
  year:         number
  score:        number
  presentCount: number
  absentCount:  number
  student?:     Pick<ApiUser, "id" | "_id" | "name" | "avatarUrl" | "grade">
}

export interface ApiRankingEntry {
  rank:         number
  score:        number
  presentCount: number
  lateCount:    number
  absentCount:  number
  bonusPoints:  number
  student:      Pick<ApiUser, "id" | "_id" | "name" | "email" | "avatarUrl" | "grade">
}

export interface ApiPost {
  _id?:         string
  id?:          string
  groupId:      string
  authorId:     string
  content:      string
  imageUrl:     string | null
  author?:      Pick<ApiUser, "id" | "_id" | "name" | "avatarUrl">
  likeCount:    number
  commentCount: number
  isLiked:      boolean
  createdAt:    string
  updatedAt:    string
}

export interface ApiComment {
  _id?:            string
  id?:             string
  postId:          string
  authorId:        string
  content:         string
  parentCommentId: string | null
  author?:         Pick<ApiUser, "id" | "_id" | "name" | "avatarUrl">
  replies?:        ApiComment[]
  replyCount:      number
  createdAt:       string
  updatedAt:       string
}

export interface ApiNotification {
  _id?:      string
  id?:       string
  userId:    string
  type:      NotificationType
  title:     string
  message:   string
  isRead:    boolean
  metadata:  Record<string, unknown> | null
  createdAt: string
}

// ─── Anonymous Messages ───────────────────────────────────────────────────────

export interface ApiAnonymousMessage {
  _id?:       string
  id?:        string
  groupId?:   string
  group?:     Pick<ApiGroup, "id" | "_id" | "name"> | null
  teacher?:   Pick<ApiUser,  "id" | "_id" | "name" | "avatarUrl"> | null
  content:    string
  reply:      string | null
  repliedAt:  string | null
  createdAt:  string
}

// ─── Assignments ──────────────────────────────────────────────────────────────

export enum AssignmentType {
  HOMEWORK = "HOMEWORK",
  EXAM     = "EXAM",
}

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  [AssignmentType.HOMEWORK]: "واجب",
  [AssignmentType.EXAM]:     "امتحان",
}

export interface ApiChoice {
  id:   string
  text: string
}

export interface ApiQuestion {
  _id?:          string
  text:          string
  choices:       ApiChoice[]
  correctAnswer: string
  points:        number
}

export interface ApiAssignment {
  _id?:            string
  id?:             string
  groupId?:        string
  type:            AssignmentType
  title:           string
  description:     string | null
  youtubeUrl:      string | null
  dueDate:         string | null
  durationMinutes: number | null
  questions:       ApiQuestion[]
  author?:         Pick<ApiUser, "id" | "_id" | "name" | "avatarUrl">
  createdAt:       string
  updatedAt:       string
}

export interface ApiSuccess<T> {
  success: true
  data:    T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  code?:   string
  errors?: Record<string, string[]>
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse

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
  user:  ApiUser
}

export interface RegisterStudentResponse {
  token: string
  user:  ApiUser
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
  token:      string
  userId:     string
  role:       Role
  name:       string
  email:      string
  avatarUrl:  string | null
  grade:      Grade | null
  isLoggedIn: boolean
}
