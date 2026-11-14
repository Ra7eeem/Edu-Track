"use client"

import { PostCommentsSection } from "@/features/teacher/components/post-comments-section"
import { studentToggleLikeAction } from "@/features/student/actions/post.action"
import { ApiPost, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { Heart } from "lucide-react"
import { useTransition } from "react"
import { useQueryClient } from "@tanstack/react-query"

interface Props {
  posts: ApiPost[]
  groupId: string
}

/**
 * Client component — handles like toggle + shows comments section
 * on student dashboard posts.
 */
export function DashboardPostsFeed({ posts, groupId }: Props) {
  const qc = useQueryClient()
  const [, startTransition] = useTransition()

  const handleLike = (pid: string, isLiked: boolean) => {
    // Optimistic update
    qc.setQueryData(["student-dashboard-posts", groupId], (old: ApiPost[] | undefined) =>
      (old ?? posts).map((p) =>
        resolveId(p) === pid
          ? {
              ...p,
              isLiked: !isLiked,
              likeCount: isLiked ? (p.likeCount ?? 1) - 1 : (p.likeCount ?? 0) + 1,
            }
          : p
      )
    )
    startTransition(async () => {
      const res = await studentToggleLikeAction(groupId, pid)
      if (!res.success) {
        // Rollback on failure
        qc.setQueryData(["student-dashboard-posts", groupId], posts)
      }
    })
  }

  if (!posts.length) return null

  return (
    <div className="space-y-4">
      {posts.map((p) => {
        const pid = resolveId(p)
        const author = p.author as { name?: string } | undefined
        return (
          <article
            key={pid || p.createdAt}
            className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 pt-4 pb-2">
              <span className="grid size-8 place-items-center rounded-xl bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 shrink-0">
                {author?.name?.[0] ?? "م"}
              </span>
              <div>
                <p className="text-xs font-semibold">{author?.name ?? "المدرس"}</p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>

            {/* Content */}
            <p className="px-4 pb-3 text-sm leading-relaxed line-clamp-4 whitespace-pre-line">
              {p.content}
            </p>

            {/* Like row */}
            <div className="flex items-center border-b border-border/40 px-4 py-2">
              <button
                onClick={() => handleLike(pid, !!p.isLiked)}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  p.isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
              >
                <Heart
                  className={cn(
                    "size-3.5 transition-all",
                    p.isLiked && "fill-primary text-primary"
                  )}
                />
                {p.likeCount ?? 0} إعجاب
              </button>
            </div>

            {/* Comments section — student can comment */}
            <PostCommentsSection groupId={groupId} post={p} viewerRole="STUDENT" />
          </article>
        )
      })}
    </div>
  )
}
