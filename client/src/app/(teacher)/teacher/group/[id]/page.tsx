"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  currentTeacher,
  getGroupById,
  getPostsByGroup,
  getStudentsByGroup,
  mockNotifications,
} from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Heart,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react"
import Link from "next/link"
import { use, useState } from "react"

const TABS = [
  { key: "overview",    label: "نظرة عامة", icon: BarChart3       },
  { key: "students",   label: "الطلاب",     icon: Users           },
  { key: "attendance", label: "الحضور",     icon: CalendarCheck   },
  { key: "posts",      label: "المنشورات",  icon: BookOpen        },
  { key: "ranking",    label: "الترتيب",    icon: Trophy          },
]

const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

export default function GroupManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("overview")
  const group = getGroupById(id)
  const students = getStudentsByGroup(id)
  const posts = getPostsByGroup(id)

  if (!group) return (
    <div className="flex flex-col">
      <TopBar title="مجموعة غير موجودة" notifHref="/teacher/notifications" unreadCount={unread} userName={currentTeacher.name} userAvatar={currentTeacher.avatar} userAvatarColor="bg-violet-500" profileHref="/teacher/profile"/>
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
        <Button className="mt-4" variant="outline" asChild><Link href="/teacher/groups">العودة للمجموعات</Link></Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col">
      <TopBar
        title={group.name}
        subtitle={group.schedule}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      {/* Group header */}
      <div className="border-b border-border/60 bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{group.subject}</Badge>
            <span className="text-sm text-muted-foreground">{group.studentCount} طالب</span>
            <span className="text-sm text-muted-foreground">حضور {group.attendanceRate}٪</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
              <Link href={`/teacher/group/${id}/attendance`}><CalendarCheck className="size-3.5"/>تسجيل الحضور</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/teacher/group/${id}/posts`}><BookOpen className="size-3.5"/>منشور جديد</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/teacher/group/${id}/students`}><Users className="size-3.5"/>إضافة طالب</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 sm:px-6">
          <div className="flex gap-1 py-2">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="size-3.5"/>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "الطلاب",    value: group.studentCount,   color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20"  },
                { label: "نسبة الحضور", value: `${group.attendanceRate}٪`, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "المنشورات", value: group.postCount,      color: "text-cyan-600",   bg: "bg-cyan-50 dark:bg-cyan-900/20"      },
                { label: "آخر نشاط",  value: group.lastActivity,  color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20"    },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <h3 className="mb-1 text-sm font-bold">عن المجموعة</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">📅 {group.schedule}</p>
            </div>
          </div>
        )}

        {/* ── Students ── */}
        {activeTab === "students" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{students.length} طالب</p>
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
                <Link href={`/teacher/group/${id}/students`}><Users className="size-3.5"/>إدارة الطلاب</Link>
              </Button>
            </div>
            {students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 py-3">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{s.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.attendanceCount} حضور · {s.absenceCount} غياب</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-sm font-bold text-primary">#{i + 1}</p>
                  <p className="text-xs text-muted-foreground">{s.score} نقطة</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Attendance ── */}
        {activeTab === "attendance" && (
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
              <Link href={`/teacher/group/${id}/attendance`}><CalendarCheck className="size-4"/>تسجيل حضور جديد</Link>
            </Button>
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <p className="text-sm font-bold">آخر جلسة — ٢٥ أغسطس ٢٠٢٦</p>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center">
                <div><p className="text-lg font-bold text-emerald-600">٩</p><p className="text-xs text-muted-foreground">حاضر</p></div>
                <div><p className="text-lg font-bold text-rose-600">٢</p><p className="text-xs text-muted-foreground">غائب</p></div>
                <div><p className="text-lg font-bold text-amber-600">١</p><p className="text-xs text-muted-foreground">متأخر</p></div>
              </div>
            </div>
          </div>
        )}

        {/* ── Posts ── */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
              <Link href={`/teacher/group/${id}/posts`}><BookOpen className="size-4"/>إنشاء منشور جديد</Link>
            </Button>
            {posts.map(p => (
              <div key={p.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                {p.pinned && <Badge className="mb-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">📌 مثبت</Badge>}
                <p className="text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Heart className="size-3"/>{p.likes}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="size-3"/>{p.commentCount}</span>
                  <span className="ms-auto">{p.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Ranking ── */}
        {activeTab === "ranking" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">ترتيب أغسطس ٢٠٢٦</p>
            {students.map((s, i) => {
              const medals = ["🥇", "🥈", "🥉"]
              return (
                <div key={s.id} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm", i < 3 ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-950/20" : "border-border/60 bg-card")}>
                  <span className="w-7 text-center text-base">{i < 3 ? medals[i] : <span className="text-sm font-bold text-muted-foreground">#{i+1}</span>}</span>
                  <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 shrink-0">{s.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.attendanceCount} حضور</p>
                  </div>
                  <span className="text-sm font-bold text-primary">{s.score} نقطة</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
