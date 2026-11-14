/**
 * Student API Service
 * Follows Rose-App architecture: pure, strongly-typed API functions using native fetch.
 * Designed to minimize round-trips and optimize performance.
 */
import { serverFetch } from "@/shared/lib/api-server"
import {
  ApiAnonymousMessage,
  ApiAssignment,
  ApiComment,
  ApiExamSubmission,
  ApiGroup,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
  PaginatedResponse,
} from "@/shared/types/api"
import type {
  StudentAttendanceRecord,
  StudentDashboardData,
  StudentRankEntry,
} from "../types/student"

/**
 * 1. Single-request student dashboard
 * User-scoped: returns student profile, groups, unread count, posts, and ranking in 1 request.
 */
export async function getStudentDashboardApi(): Promise<StudentDashboardData> {
  return serverFetch<StudentDashboardData>("/api/students/me/dashboard")
}

/**
 * 2. Student profile data
 */
export async function getStudentProfileApi(): Promise<ApiUser> {
  return serverFetch<ApiUser>("/api/students/me")
}

/**
 * 3. Student enrolled groups
 */
export async function getStudentGroupsApi(
  limit = 20
): Promise<PaginatedResponse<ApiGroup> | ApiGroup[]> {
  return serverFetch<PaginatedResponse<ApiGroup> | ApiGroup[]>(
    `/api/students/me/groups?limit=${limit}`
  )
}

/**
 * 4. Student attendance in a group
 */
export async function getStudentAttendanceApi(
  groupId: string
): Promise<StudentAttendanceRecord[]> {
  return serverFetch<StudentAttendanceRecord[]>(
    `/api/students/me/groups/${groupId}/attendance`
  )
}

/**
 * 5. Student monthly score history
 */
export async function getStudentScoresApi(): Promise<unknown[]> {
  return serverFetch<unknown[]>("/api/students/me/scores")
}

/**
 * 6. Student personal rank in a group
 */
export async function getStudentRankApi(
  groupId: string,
  month: number,
  year: number
): Promise<StudentRankEntry> {
  return serverFetch<StudentRankEntry>(
    `/api/groups/${groupId}/ranking/students/me?month=${month}&year=${year}`
  )
}

/**
 * 7. Group general ranking board
 */
export async function getGroupRankingApi(
  groupId: string,
  month: number,
  year: number
): Promise<ApiRankingEntry[]> {
  return serverFetch<ApiRankingEntry[]>(
    `/api/groups/${groupId}/ranking?month=${month}&year=${year}`
  )
}

/**
 * 8. Group assignments (homeworks and exams)
 * Uses Next.js cache tags for targeted revalidation on submission.
 */
export async function getGroupAssignmentsApi(
  groupId: string,
  limit = 50
): Promise<ApiAssignment[]> {
  return serverFetch<ApiAssignment[]>(
    `/api/assignments/group/${groupId}?limit=${limit}`,
    {
      tags: [`student-assignments-${groupId}`],
    }
  )
}

/**
 * 9. Assignment / Exam details by ID
 */
export async function getAssignmentByIdApi(id: string): Promise<ApiAssignment> {
  return serverFetch<ApiAssignment>(`/api/assignments/${id}`)
}

/**
 * 10. Student submission for an exam
 */
export async function getAssignmentSubmissionApi(
  id: string
): Promise<ApiExamSubmission | null> {
  return serverFetch<ApiExamSubmission | null>(
    `/api/assignments/${id}/my-submission`
  )
}

/**
 * 11. Teachers belonging to a group
 */
export async function getGroupTeachersApi(groupId: string): Promise<ApiUser[]> {
  return serverFetch<ApiUser[]>(`/api/groups/${groupId}/teachers`)
}

/**
 * 12. Student anonymous messages
 */
export async function getStudentAnonymousMessagesApi(
  limit = 50
): Promise<PaginatedResponse<ApiAnonymousMessage>> {
  return serverFetch<PaginatedResponse<ApiAnonymousMessage>>(
    `/api/anonymous/me?limit=${limit}`
  )
}

/**
 * 13. Group posts feed
 */
export async function getGroupPostsApi(
  groupId: string,
  limit = 50
): Promise<PaginatedResponse<ApiPost> | ApiPost[]> {
  return serverFetch<PaginatedResponse<ApiPost> | ApiPost[]>(
    `/api/groups/${groupId}/posts?limit=${limit}`
  )
}

/**
 * 14. Comments for a post
 */
export async function getPostCommentsApi(
  groupId: string,
  postId: string,
  limit = 50
): Promise<PaginatedResponse<ApiComment> | ApiComment[]> {
  return serverFetch<PaginatedResponse<ApiComment> | ApiComment[]>(
    `/api/groups/${groupId}/posts/${postId}/comments?limit=${limit}`
  )
}

/**
 * 15. Comment replies
 */
export async function getCommentRepliesApi(
  groupId: string,
  postId: string,
  commentId: string,
  limit = 50
): Promise<PaginatedResponse<ApiComment> | { data: ApiComment[] }> {
  return serverFetch<PaginatedResponse<ApiComment> | { data: ApiComment[] }>(
    `/api/groups/${groupId}/posts/${postId}/comments/${commentId}/replies?limit=${limit}`
  )
}

