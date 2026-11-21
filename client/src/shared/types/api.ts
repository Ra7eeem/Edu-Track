// ─── Enums (mirror server exactly) ────────────────────────────────────────────

export enum Role {
  ADMIN   = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum Grade {
  GRADE_1  = "GRADE_1",
  GRADE_2  = "GRADE_2",
  GRADE_3  = "GRADE_3",
  GRADE_4  = "GRADE_4",
  GRADE_5  = "GRADE_5",
  GRADE_6  = "GRADE_6",
  GRADE_7  = "GRADE_7",
  GRADE_8  = "GRADE_8",
  GRADE_9  = "GRADE_9",
  GRADE_10 = "GRADE_10",
  GRADE_11 = "GRADE_11",
  GRADE_12 = "GRADE_12",
  // خريجو الطلائع: students who have graduated from school and are now university students
  GRADE_13 = "GRADE_13",
}

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.GRADE_1]:  "الصف الأول الابتدائي",
  [Grade.GRADE_2]:  "الصف الثاني الابتدائي",
  [Grade.GRADE_3]:  "الصف الثالث الابتدائي",
  [Grade.GRADE_4]:  "الصف الرابع الابتدائي",
  [Grade.GRADE_5]:  "الصف الخامس الابتدائي",
  [Grade.GRADE_6]:  "الصف السادس الابتدائي",
  [Grade.GRADE_7]:  "الصف الأول الإعدادي",
  [Grade.GRADE_8]:  "الصف الثاني الإعدادي",
  [Grade.GRADE_9]:  "الصف الثالث الإعدادي",
  [Grade.GRADE_10]: "الصف الأول الثانوي",
  [Grade.GRADE_11]: "الصف الثاني الثانوي",
  [Grade.GRADE_12]: "الصف الثالث الثانوي",
  [Grade.GRADE_13]: "خريجو الطلائع",
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
  NEW_EXAM              = "NEW_EXAM",
  ATTENDANCE_RECORDED   = "ATTENDANCE_RECORDED",
  QUESTION_REPLIED      = "QUESTION_REPLIED",
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
  examsCount?: number
  createdAt: string
  updatedAt: string
}

export interface ApiGroup {
  _id?:        string
  id?:         string
  name:        string
  description: string | null
  imageUrl:    string | null
  isActive:    boolean
  grades:      Grade[]           // school grades this group accepts (empty = all)
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
  lateCount:    number
  absentCount:  number
  bonusPoints:  number
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
  availableFrom:   string | null
  availableTo:     string | null
  isHidden:        boolean
  showResults:     boolean
  questions:       ApiQuestion[]
  questionCount?:  number
  author?:         Pick<ApiUser, "id" | "_id" | "name" | "avatarUrl">
  mySubmission?:   {
    submitted:    boolean
    submittedAt:  string
    score?:       number
    total?:       number
  } | null
  createdAt:       string
  updatedAt:       string
}

export interface ApiSuccess<T> {
  success: true
  data:    T
  message?: string
}

// ─── Exam Submission ──────────────────────────────────────────────────────────
export interface ApiExamAnswer {
  questionId:     string
  chosen:         string
  questionText?:  string
  correctAnswer?: string
  points?:        number
  isCorrect?:     boolean
}

export interface ApiExamSubmission {
  _id?:               string
  id?:                string
  assignment:         string
  student?:           Pick<ApiUser, "id" | "_id" | "name" | "email"> & { grade?: string }
  score?:             number
  total?:             number
  answers?:           ApiExamAnswer[]
  answersWithDetails?:ApiExamAnswer[]
  submittedAt:        string
  showResults?:       boolean
  createdAt?:         string
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

// ─── Session (NextAuth) ──────────────────────────────────────────────────

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

// ─── StudentNote ──────────────────────────────────────────────────────────────
export interface ApiStudentNote {
  _id?:      string
  id?:       string
  teacher:   string
  student:   string
  group:     string
  content:   string
  createdAt: string
  updatedAt: string
}

// ─── Attendance Register (كشاف) ───────────────────────────────────────────────
export interface AttendanceRegisterStudent {
  id:      string
  name:    string
  records: { date: string; status: string }[]
}

export interface AttendanceRegister {
  dates:    string[]
  students: AttendanceRegisterStudent[]
  month:    number
  year:     number
}

// ─── Gamified Teams & Student Tasks ───────────────────────────────────────────

export interface ApiTeamMember {
  _id?:            string
  id?:             string
  name:            string
  email?:          string
  avatarUrl?:      string | null
  grade?:          Grade
  phone?:          string
  individualScore: number
  presentCount?:   number
  internalRank?:   number
}

export interface ApiTeam {
  _id:                string
  id?:                string
  name:               string
  classroom:          string
  teacher:            string
  totalScore:         number
  currentCycleScore:  number
  teamRank?:          number
  membersCount:       number
  members:            ApiTeamMember[]
  createdAt:          string
}

export interface ApiStudentTeamInfo {
  team: {
    _id:               string
    id?:               string
    name:              string
    totalScore:        number
    currentCycleScore: number
    teamRank:          number
    totalTeams:        number
  }
  studentRankInTeam:  number
  studentScoreInTeam: number
  totalMembersInTeam: number
}

export interface ApiStudentTask {
  _id?:        string
  id?:         string
  student:     string
  title:       string
  isCompleted: boolean
  dueDate?:    string | null
  order:       number
  createdAt:   string
  updatedAt:   string
}

export interface StudentTaskStats {
  total:      number
  completed:  number
  pending:    number
  percentage: number
}

export interface ApiStudentTasksResponse {
  tasks: ApiStudentTask[]
  stats: StudentTaskStats
}

// ─── Class Tasks & Tracking ───────────────────────────────────────────────────

export enum TaskType {
  ONCE = "ONCE",
  DAILY = "DAILY",
}

export interface ApiClassTask {
  _id:          string
  id?:          string
  classroom:    string
  teacher:      string
  title:        string
  description?: string | null
  type?:        TaskType | "ONCE" | "DAILY"
  dueDate?:     string | null
  isActive:     boolean
  createdAt:    string
  stats?: {
    completedCount: number
    totalStudents:  number
    percentage:     number
  }
  isCompleted?: boolean
  completedAt?: string | null
  streak?:      number
  targetDate?:  string
}

export interface ApiClassTaskProgressItem {
  student: {
    _id?:       string
    id?:        string
    name:       string
    email?:     string
    avatarUrl?: string | null
    grade?:     string
    phone?:     string
  }
  completedAt?: string
}

export interface ApiClassTaskProgressResponse {
  task: ApiClassTask
  selectedDate?: string
  completed: ApiClassTaskProgressItem[]
  pending: Array<{
    student: {
      _id?:       string
      id?:        string
      name:       string
      email?:     string
      avatarUrl?: string | null
      grade?:     string
      phone?:     string
    }
  }>
  stats: {
    total:          number
    completedCount: number
    pendingCount:   number
    percentage:     number
  }
}

// ─── Daily Questions & Quiz ───────────────────────────────────────────────────

export interface ApiDailyQuestion {
  _id:                 string
  id?:                 string
  classroom:           string
  date:                string
  question:            string
  options:             string[]
  rewardPoints:        number
  correctOptionIndex?: number
  explanation?:        string
  alreadyAnswered:     boolean
  previousAnswer?: {
    selectedOptionIndex: number
    isCorrect:           boolean
    pointsEarned:        number
    answeredAt?:         string
  } | null
}

export interface ApiDailyAnswerResult {
  isCorrect:           boolean
  correctOptionIndex:  number
  explanation?:        string
  pointsEarned:        number
  selectedOptionIndex: number
  answerId?:           string
}
