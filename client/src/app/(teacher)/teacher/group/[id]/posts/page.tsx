import { PostsFeedClient } from "@/features/teacher/components/posts-feed-client"
import { TopBar } from "@/shared/components/layout/topbar"
import { resolveList, resolveOne, serverFetch } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, ApiPost, PaginatedResponse } from "@/shared/types/api"

export default async function PostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getSessionData()

  const [groupRes, postsRes, notifsRes] = await Promise.allSettled([
    serverFetch<ApiGroup>(`/api/groups/${id}`),
    serverFetch<PaginatedResponse<ApiPost>>(`/api/groups/${id}/posts?limit=20`, { tags: [`group-${id}-posts`] }),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const group  = resolveOne(groupRes  as PromiseSettledResult<ApiGroup | null>, null)
  const posts  = resolveList(postsRes  as PromiseSettledResult<PaginatedResponse<ApiPost>         | ApiPost[]         | null>)
  const unread = resolveList(notifsRes as PromiseSettledResult<PaginatedResponse<ApiNotification>  | ApiNotification[] | null>)
    .filter((n) => !n.isRead).length

  return (
    <div className="flex flex-col">
      <TopBar
        title="المنشورات"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
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
