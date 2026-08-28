"use client"

import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { createPostAction, deletePostAction, toggleLikeAction } from "@/features/teacher/actions/post.action"
import { useGroupPosts } from "@/features/teacher/hooks/use-group-posts"
import { ApiPost, resolveId } from "@/shared/types/api"
import { Heart, MessageCircle, MoreVertical, PenLine, Plus, Trash2 } from "lucide-react"
import { useTransition, useState } from "react"

interface Props {
  groupId:      string
  initialPosts: ApiPost[]
  authorName:   string
  authorAvatar: string
}

export function PostsFeedClient({ groupId, initialPosts, authorName, authorAvatar }: Props) {
  const [content,     setContent]     = useState("")
  const [showCompose, setShowCompose] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [isPending,   startTransition] = useTransition()

  const { data, refetch } = useGroupPosts(groupId)
  const posts = data?.data ?? initialPosts

  const handleCreate = () => {
    if (!content.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createPostAction(groupId, content.trim())
      if (res.success) {
        setContent("")
        setShowCompose(false)
        refetch()
      } else {
        setError(res.error ?? "حدث خطأ")
      }
    })
  }

  const handleDelete = (postId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنشور؟")) return
    startTransition(async () => {
      await deletePostAction(groupId, postId)
      refetch()
    })
  }

  const handleLike = (postId: string) => {
    startTransition(async () => {
      await toggleLikeAction(groupId, postId)
      refetch()
    })
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      {/* Compose */}
      {!showCompose ? (
        <button
          onClick={() => setShowCompose(true)}
          className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-sm text-primary/70 hover:border-primary/70 hover:text-primary transition-all"
        >
          <PenLine className="size-4 shrink-0" />
          ما الذي تريد مشاركته مع طلابك؟
        </button>
      ) : (
        <div className="mb-5 rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
          {error && (
            <p className="mb-2 text-xs text-destructive">{error}</p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب منشورك هنا..."
            rows={4}
            autoFocus
            className="w-full resize-none rounded-xl bg-muted/40 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setShowCompose(false); setContent(""); setError(null) }}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
              onClick={handleCreate}
              disabled={isPending || !content.trim()}
            >
              <Plus className="size-3.5" />
              {isPending ? "جارٍ النشر..." : "نشر"}
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-medium">لا توجد منشورات بعد</p>
          <p className="mt-1 text-sm text-muted-foreground">كن أول من ينشر في هذه المجموعة!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => {
            const author = (p.author as { name?: string; avatarUrl?: string } | undefined)
            const aName   = author?.name   ?? authorName
            const aAvatar = aName[0]       ?? authorAvatar
            return (
              <article key={p.id} className="rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="flex items-center justify-between px-4 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                      {aAvatar}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{aName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(resolveId(p))}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="حذف المنشور"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <p className="px-4 pt-3 pb-4 text-sm leading-relaxed whitespace-pre-line">
                  {p.content}
                </p>

                <div className="flex items-center gap-4 border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  <button
                    onClick={() => handleLike(resolveId(p))}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <Heart className={`size-3.5 ${p.isLiked ? "fill-primary text-primary" : ""}`} />
                    {p.likeCount} إعجاب
                  </button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" />
                    {p.commentCount} تعليق
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
