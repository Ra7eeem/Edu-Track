"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { getGroupById, getPostsByGroup, getStudentsByGroup, mockTeachers } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { BarChart3, BookOpen, CalendarCheck, Heart, MessageCircle, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { use, useState } from "react"

const TABS = [
  { key:"overview",  label:"نظرة عامة", icon: BarChart3     },
  { key:"students",  label:"الطلاب",     icon: Users         },
  { key:"attendance",label:"الحضور",     icon: CalendarCheck },
  { key:"ranking",   label:"الترتيب",    icon: Trophy        },
  { key:"posts",     label:"المنشورات",  icon: BookOpen      },
  { key:"teachers",  label:"المدرسون",   icon: Users         },
]

export default function AdminGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tab, setTab] = useState("overview")
  const group = getGroupById(id)
  const students = getStudentsByGroup(id)
  const posts = getPostsByGroup(id)
  const teachers = group ? mockTeachers.filter(t => group.teacherIds.includes(t.id)) : []

  if (!group) return (
    <div className="flex flex-col">
      <TopBar title="مجموعة غير موجودة" notifHref="/admin/dashboard" userName="مدير" userAvatar="ا" userAvatarColor="bg-rose-500" profileHref="/admin/dashboard"/>
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
        <Button className="mt-4" variant="outline" asChild><Link href="/admin/groups">العودة</Link></Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col">
      <TopBar title={group.name} subtitle={group.schedule} notifHref="/admin/dashboard" userName="مدير" userAvatar="ا" userAvatarColor="bg-rose-500" profileHref="/admin/dashboard"/>

      {/* Header info */}
      <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">{group.subject}</Badge>
          <span className="text-muted-foreground">{group.studentCount} طالب</span>
          <span className="text-muted-foreground">{group.attendanceRate}٪ حضور</span>
          <span className="text-muted-foreground ms-auto text-xs">آخر نشاط: {group.lastActivity}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 py-2 sm:px-6">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={()=>setTab(t.key)}
                className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  tab===t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <t.icon className="size-3"/>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {l:"الطلاب",    v:group.studentCount,    c:"text-violet-600"},
                {l:"نسبة الحضور",v:`${group.attendanceRate}٪`,c:"text-emerald-600"},
                {l:"المنشورات", v:group.postCount,       c:"text-cyan-600"},
                {l:"المدرسون",  v:group.teacherIds.length,c:"text-amber-600"},
              ].map(s => (
                <div key={s.l} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                  <p className={`text-2xl font-extrabold ${s.c}`}>{s.v}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <h3 className="mb-1 text-sm font-bold">عن المجموعة</h3>
              <p className="text-sm text-muted-foreground">{group.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">📅 {group.schedule} · 📅 أُنشئت {group.createdAt}</p>
            </div>
          </div>
        )}

        {/* Students */}
        {tab === "students" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">{students.length} طالب</p>
            {students.map((s,i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{s.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <div className="text-end shrink-0 hidden sm:block">
                  <p className="text-xs text-muted-foreground">{s.attendanceCount} حضور · {s.absenceCount} غياب</p>
                  <p className="text-xs font-bold text-primary">{s.score} نقطة</p>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">#{i+1}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Attendance */}
        {tab === "attendance" && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <p className="text-sm font-bold mb-3">آخر جلسة — ٢٥ أغسطس ٢٠٢٦</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20"><p className="text-xl font-bold text-emerald-600">٩</p><p className="text-xs text-muted-foreground">حاضر</p></div>
                <div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/20"><p className="text-xl font-bold text-rose-600">٢</p><p className="text-xs text-muted-foreground">غائب</p></div>
                <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20"><p className="text-xl font-bold text-amber-600">١</p><p className="text-xs text-muted-foreground">متأخر</p></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">عرض سجل الحضور الكامل متاح في الإصدار القادم</p>
          </div>
        )}

        {/* Ranking */}
        {tab === "ranking" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">ترتيب أغسطس ٢٠٢٦</p>
            {students.map((s,i) => (
              <div key={s.id} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                i<3?"border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10":"border-border/60 bg-card")}>
                <span className="w-6 text-center shrink-0">{i<3?["🥇","🥈","🥉"][i]:<span className="text-xs font-bold text-muted-foreground">#{i+1}</span>}</span>
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{s.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400" style={{width:`${(s.score/students[0].score)*100}%`}}/>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary shrink-0">{s.score}</span>
              </div>
            ))}
          </div>
        )}

        {/* Posts */}
        {tab === "posts" && (
          <div className="space-y-4">
            {posts.map(p => {
              const teacher = mockTeachers.find(t => t.id === p.teacherId)
              return (
                <div key={p.id} className="rounded-2xl border border-border/60 bg-card shadow-sm p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">{teacher?.avatar}</span>
                    <div><p className="text-xs font-semibold">{teacher?.name}</p><p className="text-[10px] text-muted-foreground">{p.createdAt}</p></div>
                    {p.pinned && <Badge className="ms-auto bg-amber-100 text-amber-700 border-0 text-[10px]">📌 مثبت</Badge>}
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                  <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="size-3"/>{p.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="size-3"/>{p.commentCount}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Teachers */}
        {tab === "teachers" && (
          <div className="space-y-3">
            {teachers.map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 shadow-sm">
                <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{t.avatar}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.email} · {t.subject}</p>
                </div>
                <Badge variant={t.status==="active"?"secondary":"outline"} className={cn("text-[10px] shrink-0", t.status==="active"&&"bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                  {t.status==="active"?"نشط":"غير نشط"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
