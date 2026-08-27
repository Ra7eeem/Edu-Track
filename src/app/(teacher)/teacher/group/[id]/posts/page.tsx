"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { currentTeacher, getGroupById, getPostsByGroup, mockNotifications } from "@/shared/data/mock"
import { Heart, MessageCircle, MoreVertical, PenLine, Pin, Plus } from "lucide-react"
import { use, useState } from "react"

const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

export default function PostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const group = getGroupById(id)
  const posts = getPostsByGroup(id)
  const [showCompose, setShowCompose] = useState(false)
  const [content, setContent] = useState("")
  const [localPosts, setLocalPosts] = useState(posts)

  const submit = () => {
    if (!content.trim()) return
    setLocalPosts(prev => [{
      id: `p-new-${Date.now()}`, groupId: id, teacherId: currentTeacher.id,
      content, likes: 0, commentCount: 0, createdAt: "الآن"
    }, ...prev])
    setContent("")
    setShowCompose(false)
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="المنشورات"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        {/* Compose box */}
        {!showCompose ? (
          <button
            onClick={() => setShowCompose(true)}
            className="mb-5 flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-sm text-primary/70 hover:border-primary/70 hover:text-primary transition-all"
          >
            <PenLine className="size-4 shrink-0"/>
            ما الذي تريد مشاركته مع طلابك؟
          </button>
        ) : (
          <div className="mb-5 rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب منشورك هنا..."
              rows={4}
              autoFocus
              className="w-full resize-none rounded-xl bg-muted/40 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setShowCompose(false); setContent("") }}>إلغاء</Button>
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={submit} disabled={!content.trim()}>
                <Plus className="size-3.5"/>نشر
              </Button>
            </div>
          </div>
        )}

        {/* Feed */}
        {localPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="font-medium">لا توجد منشورات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">كن أول من ينشر في هذه المجموعة!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {localPosts.map(p => (
              <article key={p.id} className="rounded-2xl border border-border/60 bg-card shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                      {currentTeacher.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{currentTeacher.name}</p>
                      <p className="text-xs text-muted-foreground">{p.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.pinned && <Pin className="size-3.5 text-amber-500"/>}
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreVertical className="size-4"/></button>
                  </div>
                </div>

                {/* Content */}
                <p className="px-4 pt-3 pb-4 text-sm leading-relaxed whitespace-pre-line">{p.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <Heart className="size-3.5"/>{p.likes} إعجاب
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    <MessageCircle className="size-3.5"/>{p.commentCount} تعليق
                  </button>
                  {p.pinned && <Badge className="ms-auto bg-amber-100 text-amber-700 border-0 text-[10px] dark:bg-amber-900/30 dark:text-amber-300">📌 مثبت</Badge>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
