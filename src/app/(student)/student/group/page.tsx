"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import {
  currentStudent,
  currentStudentGroup,
  getNotificationsByUser,
  getPostsByGroup,
  getStudentsByGroup,
  mockTeachers,
} from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { Heart, MessageCircle, MoreVertical, Pin, Users } from "lucide-react"
import { useState } from "react"

const notifs = getNotificationsByUser(currentStudent.id)
const unread = notifs.filter(n => !n.read).length
const posts  = getPostsByGroup(currentStudentGroup.id)
const students = getStudentsByGroup(currentStudentGroup.id)
const teacher = mockTeachers.find(t => currentStudentGroup.teacherIds.includes(t.id))

const TABS = [
  { key: "posts",    label: "المنشورات" },
  { key: "ranking",  label: "الترتيب"  },
  { key: "students", label: "الأعضاء"  },
]

export default function StudentGroupPage() {
  const [tab, setTab] = useState("posts")

  return (
    <div className="flex flex-col">
      <TopBar
        title={currentStudentGroup.name}
        subtitle={currentStudentGroup.schedule}
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={currentStudent.name}
        userAvatar={currentStudent.avatar}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      {/* Group header */}
      <div className="border-b border-border/60 bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-2xl flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{currentStudentGroup.subject}</Badge>
          <span className="flex items-center gap-1"><Users className="size-3.5"/>{currentStudentGroup.studentCount} طالب</span>
          <span>معدل الحضور {currentStudentGroup.attendanceRate}٪</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-2xl flex gap-1 px-4 py-2 sm:px-6">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("rounded-xl px-4 py-2 text-xs font-medium transition-all",
                tab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        {/* Posts */}
        {tab === "posts" && (
          <div className="space-y-4">
            {posts.map(p => (
              <article key={p.id} className="rounded-2xl border border-border/60 bg-card shadow-sm">
                <div className="flex items-center justify-between px-4 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">{teacher?.avatar}</span>
                    <div>
                      <p className="text-sm font-semibold">{teacher?.name}</p>
                      <p className="text-xs text-muted-foreground">{p.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {p.pinned && <Pin className="size-3.5 text-amber-500"/>}
                    <button className="text-muted-foreground"><MoreVertical className="size-4"/></button>
                  </div>
                </div>
                <p className="px-4 pt-3 pb-4 text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                <div className="flex items-center gap-4 border-t border-border/40 px-4 py-3 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors"><Heart className="size-3.5"/>{p.likes} إعجاب</button>
                  <button className="flex items-center gap-1.5 hover:text-primary transition-colors"><MessageCircle className="size-3.5"/>{p.commentCount} تعليق</button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Ranking */}
        {tab === "ranking" && (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">ترتيب أغسطس ٢٠٢٦</p>
            {students.map((s, i) => {
              const isMe = s.id === currentStudent.id
              return (
                <div key={s.id} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                  isMe ? "border-primary/30 bg-primary/5" : i < 3 ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10" : "border-border/60 bg-card")}>
                  <span className="w-6 text-center text-sm shrink-0">{i<3?["🥇","🥈","🥉"][i]:<span className="text-xs font-bold text-muted-foreground">#{i+1}</span>}</span>
                  <span className={cn("grid size-8 place-items-center rounded-xl text-xs font-bold shrink-0", isMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>{s.avatar}</span>
                  <span className={cn("flex-1 text-sm truncate", isMe && "font-bold text-primary")}>{s.name}{isMe && " (أنت)"}</span>
                  <span className="text-sm font-bold text-primary shrink-0">{s.score}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Students */}
        {tab === "students" && (
          <div className="space-y-2">
            <p className="mb-3 text-xs text-muted-foreground">{students.length} عضو</p>
            {students.map(s => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{s.avatar}</span>
                <span className="flex-1 text-sm">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.score} نقطة</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
