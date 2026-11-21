import { PostsFeedClient } from "@/features/teacher/components/posts-feed-client"
import { TopBar } from "@/shared/components/layout/topbar"
import {
  getGroupPostsForTeacherApi,
  getTeacherGroupByIdApi,
  getTeacherNotificationsApi,
} from "@/features/teacher/apis/teacher.api"
import { toPaginatedArray } from "@/shared/lib/api-helpers"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiPost } from "@/shared/types/api"

export default async function PostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, postsRes, notifsRes] = await Promise.allSettled([
    getTeacherGroupByIdApi(id),
    getGroupPostsForTeacherApi(id, 20),
    getTeacherNotificationsApi(1),
  ])

  const rawGroup = groupRes.status === "fulfilled" ? groupRes.value : null
  const group = rawGroup ? ("group" in rawGroup ? rawGroup.group : rawGroup) as ApiGroup : null
  const posts = postsRes.status === "fulfilled" ? toPaginatedArray(postsRes.value) : []
  const unread = notifsRes.status === "fulfilled"
    ? toPaginatedArray(notifsRes.value).filter((n) => !n.isRead).length
    : 0

  return (
    <div className="flex flex-col">
      <TopBar
        title="المنشورات"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />
      <PostsFeedClient
        groupId={id}
        initialPosts={posts}
        authorName={session?.name ?? ""}
        authorAvatar={(session?.name ?? "م")[0]}
      />
    </div>
  )
}
