"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import {
  ListRowSkeleton,
  PostCardSkeleton,
  RankRowSkeleton,
  Skeleton,
  StatCardSkeleton,
} from "@/shared/components/ui/skeleton"
import {
  useAdminGroupDetail,
  useAdminGroupPosts,
  useAdminGroupRanking,
  useAdminGroupStudents,
  useAdminGroupTeachers,
} from "@/features/admin/hooks/use-admin-group"
import { cn } from "@/shared/lib/tailwind-cn"
import { resolveId } from "@/shared/types/api"
import type {
  ApiGroupMembership,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
} from "@/shared/types/api"
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
  { key: "overview",   label: "نظرة عامة", icon: BarChart3     },
  { key: "students",   label: "الطلاب",     icon: Users         },
  { key: "attendance", label: "الحضور",     icon: CalendarCheck },
  { key: "ranking",    label: "الترتيب",    icon: Trophy        },
  { key: "posts",      label: "المنشورات",  icon: BookOpen      },
  { key: "teachers",   label: "المدرسون",   icon: Users         },
]

const ARABIC_MONTHS = [
  "", "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

const medals = ["🥇", "🥈", "🥉"]

export default function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [tab, setTab] = useState("overview")
  const now = new Date()

  const { data: group,    isLoading: gLoading } = useAdminGroupDetail(id)
  const { data: students, isLoading: sLoading } = useAdminGroupStudents(id)
  const { data: teachers, isLoading: tLoading } = useAdminGroupTeachers(id)
  const { data: posts,    isLoading: pLoading } = useAdminGroupPosts(id)
  const { data: ranking,  isLoading: rLoading } = useAdminGroupRanking(id)

  const rankingList  = ranking ?? []
  const postsList    = posts   ?? []
  const studentsList = students ?? []
  const teachersList = teachers ?? []

  const top3 = rankingList.slice(0, 3)

  console.log(studentsList);
  

  return (
    <div className="flex flex-col">
      <TopBar
        title={group?.name ?? (gLoading ? "جارٍ التحميل..." : "مجموعة")}
        subtitle={
          group
            ? `أُنشئت ${new Date(group.createdAt).toLocaleDateString("ar-EG")}`
            : undefined
        }
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      {/* Sub-header */}
      {gLoading ? (
        <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-5xl flex gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24 ms-auto" />
          </div>
        </div>
      ) : !group ? (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/admin/groups">العودة للمجموعات</Link>
          </Button>
        </div>
      ) : (
        <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-5xl flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {group.description && <span className="truncate max-w-xs">{group.description}</span>}
            <span className="text-xs ms-auto">
              {group.isActive ? "✅ نشطة" : "⛔ غير نشطة"}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 py-2 sm:px-6">
          <div className="flex gap-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  tab === t.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <t.icon className="size-3" />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-4">
            {gLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)}
              </div>
            ) : group && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { l: "المنشورات",    v: postsList.length,    c: "text-cyan-600"           },
                    { l: "المدرسون",     v: teachersList.length, c: "text-amber-600"          },
                    { l: "عدد الطلاب",  v: studentsList.length, c: "text-violet-600"         },
                    { l: "في الترتيب",  v: rankingList.length,  c: "text-emerald-600"        },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                      <p className={`text-2xl font-extrabold ${s.c}`}>{s.v}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.l}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <h3 className="mb-2 text-sm font-bold">عن المجموعة</h3>
                  <p className="text-sm text-muted-foreground">{group.description ?? "لا يوجد وصف"}</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Students ── */}
        {tab === "students" && (
          <div className="space-y-2">
            {sLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card">
                  <ListRowSkeleton cols={4} />
                </div>
              ))
            ) : (
              <>
                <p className="mb-3 text-xs text-muted-foreground">{studentsList.length} طالب</p>
                {studentsList.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">لا يوجد طلاب مسجّلون بعد</div>
                )}
                {studentsList.map((m: ApiGroupMembership, i: number) => {
                  const uid   = resolveId(m.student) || m.studentId
                  const name  = (m.student as { name?: string } | undefined)?.name  ?? m.studentId
                  const email = (m.student as { email?: string } | undefined)?.email ?? ""
                  return (
                    <div key={uid || i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                        {name[0] ?? "؟"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted-foreground">{email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── Attendance ── */}
        {tab === "attendance" && (
          <div className="rounded-2xl border border-border/60 bg-card p-5 text-center text-sm text-muted-foreground">
            سجل الحضور الكامل متاح من صفحة إدارة المجموعة للمدرس
          </div>
        )}

        {/* ── Ranking ── */}
        {tab === "ranking" && (
          <div className="space-y-3">
            {rLoading ? (
              Array.from({ length: 8 }).map((_, i) => <RankRowSkeleton key={i} />)
            ) : rankingList.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-4xl mb-3">🏆</p>
                <p className="font-medium">لا يوجد ترتيب بعد</p>
                <p className="mt-1 text-sm text-muted-foreground">سيظهر الترتيب بعد تسجيل الحضور</p>
              </div>
            ) : (
              <>
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-sm font-bold">
                    ترتيب {ARABIC_MONTHS[now.getMonth() + 1]} {now.getFullYear()}
                  </h2>
                  <span className="text-xs text-muted-foreground">{rankingList.length} طالب</span>
                </div>

                {/* Podium — top 3 */}
                {top3.length >= 2 && (
                  <div className="mb-4 grid grid-cols-3 items-end gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/10 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
                    {([top3[1], top3[0], top3[2]] as (ApiRankingEntry | undefined)[]).map((entry, i) => {
                      if (!entry) return <div key={i} />
                      const pos    = i === 0 ? 2 : i === 1 ? 1 : 3
                      const heights = ["h-20", "h-28", "h-16"]
                      const podColor =
                        pos === 1 ? "bg-gradient-to-t from-amber-400 to-amber-300"
                        : pos === 2 ? "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600"
                        : "bg-gradient-to-t from-amber-700/60 to-amber-600/50"
                      const sid = resolveId(entry.student)
                      return (
                        <div key={sid} className={cn("flex flex-col items-center gap-1", i === 1 && "-mt-3")}>
                          <span className="text-2xl">{medals[pos - 1]}</span>
                          <span className="grid size-10 place-items-center rounded-2xl bg-white text-sm font-bold text-violet-600 shadow-sm dark:bg-card">
                            {entry.student.name[0]}
                          </span>
                          <p className="text-center text-[10px] font-semibold leading-tight">
                            {entry.student.name.split(" ")[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{entry.score} نقطة</p>
                          <div className={cn("w-full rounded-t-xl", heights[i], podColor)} />
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Full list */}
                <div className="space-y-2">
                  {rankingList.map((entry: ApiRankingEntry) => {
                    const sid = resolveId(entry.student)
                    return (
                      <div
                        key={sid}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                          entry.rank <= 3
                            ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10"
                            : "border-border/60 bg-card"
                        )}
                      >
                        <span className="w-7 text-center shrink-0">
                          {entry.rank <= 3
                            ? medals[entry.rank - 1]
                            : <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>
                          }
                        </span>
                        <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                          {entry.student.name[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{entry.student.name}</p>
                          <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
                              style={{
                                width: rankingList[0]?.score
                                  ? `${(entry.score / rankingList[0].score) * 100}%`
                                  : "0%",
                              }}
                            />
                          </div>
                        </div>
                        <div className="text-end shrink-0">
                          <p className="text-sm font-bold text-primary">{entry.score}</p>
                          <p className="text-[10px] text-muted-foreground">{entry.presentCount} حضور · {entry.absentCount} غياب</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Posts ── */}
        {tab === "posts" && (
          <div className="space-y-4">
            {pLoading ? (
              Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
            ) : postsList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">لا توجد منشورات</div>
            ) : (
              postsList.map((p: ApiPost) => {
                const pid    = resolveId(p)
                const author = p.author as { name?: string } | undefined
                return (
                  <div key={pid} className="rounded-2xl border border-border/60 bg-card shadow-sm p-4">
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                        {author?.name?.[0] ?? "م"}
                      </span>
                      <div>
                        <p className="text-xs font-semibold">{author?.name ?? "المدرس"}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Heart className="size-3" />{p.likeCount ?? 0} إعجاب</span>
                      <span className="flex items-center gap-1"><MessageCircle className="size-3" />{p.commentCount ?? 0} تعليق</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ── Teachers ── */}
        {tab === "teachers" && (
          <div className="space-y-3">
            {tLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card">
                  <ListRowSkeleton cols={3} />
                </div>
              ))
            ) : teachersList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">لا يوجد مدرسون مسجّلون</div>
            ) : (
              teachersList.map((t: ApiUser) => {
                const tid = resolveId(t)
                return (
                  <div
                    key={tid}
                    className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 shadow-sm"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                      {t.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.email}</p>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] rounded-full px-2 py-0.5 font-medium shrink-0",
                        t.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {t.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
