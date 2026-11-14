import {
  getGroupPostsApi,
  getNotificationsApi,
  getStudentGroupsApi,
  getStudentProfileApi,
} from "@/features/student/apis/student.api"
import { StudentGroupClient } from "@/features/student/components/student-group-client"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { ApiGroup, ApiNotification, resolveId } from "@/shared/types/api"

export default async function StudentGroupPage() {
  const [profile, groupsResponse, notificationsResponse] = await Promise.all([
    getStudentProfileApi().catch(() => null),
    getStudentGroupsApi().catch(() => null),
    getNotificationsApi(50).catch(() => null),
  ])

  const groups = toPaginatedArray<ApiGroup>(groupsResponse)
  const firstGroup = groups[0]
  const firstGroupId = firstGroup ? resolveId(firstGroup) : ""

  const initialPosts = firstGroupId
    ? await getGroupPostsApi(firstGroupId, 20).catch(() => null)
    : null

  const notifications = toPaginatedArray<ApiNotification>(notificationsResponse)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <StudentGroupClient
      initialUser={profile}
      initialGroups={groupsResponse}
      initialPosts={initialPosts}
      unreadCount={unreadCount}
    />
  )
}
