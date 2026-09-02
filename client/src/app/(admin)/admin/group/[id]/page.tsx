"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { AttendanceRegister } from "@/features/teacher/components/attendance-register"
import { PostCommentsSection } from "@/features/teacher/components/post-comments-section"
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
  useRemoveStudentFromGroup,
} from "@/features/admin/hooks/use-admin-group"
import {
  useAdminTeachers,
  useAddTeacherToGroup,
  useRemoveTeacherFromGroup,
} from "@/features/admin/hooks/use-admin"
import { cn } from "@/shared/lib/tailwind-cn"
import { resolveId } from "@/shared/types/api"
import type {
  ApiPost,
  ApiRankingEntry,
  ApiUser,
} from "@/shared/types/api"
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  AlertTriangle,
  Heart,
  MessageCircle,
  Plus,
  Trophy,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import { use, useState, useRef } from "react"

const TABS = [
  { key: "overview",   label: "نظرة عامة",  icon: BarChart3     },
  { key: "students",   label: "الطلاب",      icon: Users         },
  { key: "attendance", label: "الحضور",      icon: CalendarCheck },
  { key: "ranking",    label: "الترتيب",     icon: Trophy        },
  { key: "posts",      label: "المنشورات",   icon: BookOpen      },
  { key: "teachers",   label: "المدرسون",    icon: Users         },
]

const ARABIC_MONTHS = [
  "", "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]
const medals = ["🥇","🥈","🥉"]

// ─── Add Teacher Modal ────────────────────────────────────────────────────────
function AddTeacherModal({
  groupId,
  currentTeacherIds,
  onClose,
}: {
  groupId: string
  currentTeacherIds: string[]
  onClose: () => void
}) {
  const { data: allTeachersRaw } = useAdminTeachers("", 1)
  const allTeachers = (allTeachersRaw ?? []).filter(
    t => !currentTeacherIds.includes(resolveId(t))
  )

  const addMut    = useAddTeacherToGroup()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [adding,  setAdding]  = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  const handleAdd = async (teacherId: string) => {
    setAdding(teacherId)
    setError(null)
    try {
      await addMut.mutateAsync({ groupId, teacherId })
      onClose()
    } catch (e: unknown) {
      const err = e as { message?: string }
      setError(err?.message ?? "حدث خطأ")
      setAdding(null)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">إضافة مدرس للمجموعة</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {allTeachers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              جميع المدرسين مضافون بالفعل إلى هذه المجموعة
            </p>
          ) : (
            allTeachers.map(t => {
              const tid = resolveId(t)
              return (
                <div key={tid} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                    {t.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                    onClick={() => handleAdd(tid)}
                    disabled={adding === tid}
                  >
                    <Plus className="size-3.5" />
                    {adding === tid ? "..." : "إضافة"}
                  </Button>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="w-full" onClick={onClose}>إغلاق</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [tab,            setTab]            = useState("overview")
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [removeTarget,   setRemoveTarget]   = useState<{ id: string; name: string } | null>(null)
  const [deleteStudent,  setDeleteStudent]  = useState<{ id: string; name: string } | null>(null)
  const now = new Date()

  const { data: group,    isLoading: gLoading } = useAdminGroupDetail(id)
  const { data: students, isLoading: sLoading } = useAdminGroupStudents(id)
  const { data: teachers, isLoading: tLoading } = useAdminGroupTeachers(id)
  const { data: posts,    isLoading: pLoading } = useAdminGroupPosts(id)
  const { data: ranking,  isLoading: rLoading } = useAdminGroupRanking(id)

  const removeMut        = useRemoveTeacherFromGroup()
  const removeStudentMut = useRemoveStudentFromGroup()

  const rankingList  = ranking  ?? []
  const postsList    = posts    ?? []
  const studentsList = students ?? []
  const teachersList = teachers ?? []
  const top3 = rankingList.slice(0, 3)

  const currentTeacherIds = teachersList.map((t: ApiUser) => resolveId(t))

  const handleRemoveTeacher = async (teacherId: string) => {
    await removeMut.mutateAsync({ groupId: id, teacherId })
    setRemoveTarget(null)
  }

  return (
    <>
      {showAddTeacher && (
        <AddTeacherModal
          groupId={id}
          currentTeacherIds={currentTeacherIds}
          onClose={() => setShowAddTeacher(false)}
        />
      )}

      {/* Remove teacher confirmation */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">👨‍🏫</p>
            <p className="font-bold">إزالة {removeTarget.name}؟</p>
            <p className="text-sm text-muted-foreground">سيتم إزالة المدرس من هذه المجموعة فقط</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRemoveTarget(null)}>إلغاء</Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleRemoveTeacher(removeTarget.id)}
                disabled={removeMut.isPending}
              >
                {removeMut.isPending ? "جارٍ الإزالة..." : "تأكيد الإزالة"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete student modal */}
      {deleteStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setDeleteStudent(null)}
        >
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-rose-600">
                <Trash2 className="size-4" />حذف الطالب
              </h2>
              <button
                onClick={() => setDeleteStudent(null)}
                className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-center">
                <div className="grid size-16 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
                  <AlertTriangle className="size-8 text-rose-500" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold">هل تريد حذف هذا الطالب؟</p>
                <p className="text-sm text-muted-foreground">
                  سيتم إزالة{" "}
                  <span className="font-bold text-foreground">{deleteStudent.name}</span>{" "}
                  من المجموعة ومسح نقاطه نهائياً
                </p>
              </div>
              {removeStudentMut.isError && (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
                  حدث خطأ أثناء الحذف
                </p>
              )}
            </div>
            <div className="flex gap-2 border-t border-border/60 px-5 py-4">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteStudent(null)} disabled={removeStudentMut.isPending}>
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90"
                onClick={() => removeStudentMut.mutate({ groupId: id, studentId: deleteStudent.id }, { onSuccess: () => setDeleteStudent(null) })}
                disabled={removeStudentMut.isPending}
              >
                <Trash2 className="size-3.5" />
                {removeStudentMut.isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <TopBar
          title={group?.name ?? (gLoading ? "جارٍ التحميل..." : "مجموعة")}
          subtitle={
            group ? `أُنشئت ${new Date(group.createdAt).toLocaleDateString("ar-EG")}` : undefined
          }
          notifHref="/admin/dashboard"
          userName="مدير"
          userAvatar="ا"
          userAvatarColor="bg-rose-500"
          profileHref="/admin/dashboard"
        />

        {/* Sub-header */}
        {!gLoading && !group ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/admin/groups">العودة للمجموعات</Link>
            </Button>
          </div>
        ) : (
          <>
            {gLoading ? (
              <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
                <div className="mx-auto max-w-5xl flex gap-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24 ms-auto" />
                </div>
              </div>
            ) : group && (
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
                  {TABS.map(t => (
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
                          { l: "المنشورات",   v: postsList.length,    c: "text-cyan-600"    },
                          { l: "المدرسون",    v: teachersList.length, c: "text-amber-600"   },
                          { l: "عدد الطلاب", v: studentsList.length, c: "text-violet-600"  },
                          { l: "في الترتيب", v: rankingList.length,  c: "text-emerald-600" },
                        ].map(s => (
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
                      {studentsList.map((s: ApiUser, i: number) => {
                        const sid   = resolveId(s)
                        const name  = s.name  ?? "طالب"
                        const email = s.email ?? ""
                        return (
                          <div key={sid || i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 transition-all hover:border-border">
                            <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                              {name.slice(0, 1)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{name}</p>
                              <p className="text-xs text-muted-foreground">{email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                            <button
                              onClick={() => setDeleteStudent({ id: sid, name })}
                              className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all dark:border-rose-800 dark:hover:bg-rose-950/20 shrink-0"
                              aria-label="حذف الطالب"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}

              {/* ── Attendance ── */}
              {tab === "attendance" && (
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <AttendanceRegister groupId={id} role="admin"/>
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

                      {top3.length >= 2 && (
                        <div className="mb-4 grid grid-cols-3 items-end gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/10 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
                          {([top3[1], top3[0], top3[2]] as (ApiRankingEntry | undefined)[]).map((entry, i) => {
                            if (!entry) return <div key={i} />
                            const pos = i===0?2:i===1?1:3
                            const heights = ["h-20","h-28","h-16"]
                            const podColor = pos===1
                              ? "bg-gradient-to-t from-amber-400 to-amber-300"
                              : pos===2
                              ? "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600"
                              : "bg-gradient-to-t from-amber-700/60 to-amber-600/50"
                            return (
                              <div key={resolveId(entry.student)} className={cn("flex flex-col items-center gap-1", i===1 && "-mt-3")}>
                                <span className="text-2xl">{medals[pos-1]}</span>
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

                      <div className="space-y-2">
                        {rankingList.map((entry: ApiRankingEntry) => (
                          <div
                            key={resolveId(entry.student)}
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
                        ))}
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
                            <span className="grid size-8 place-items-center rounded-xl bg-teal-100 text-xs font-bold text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
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
                          <div className="mt-3 border-b border-border/40 pb-1 flex gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Heart className="size-3" />{p.likeCount ?? 0} إعجاب</span>
                          </div>
                          <PostCommentsSection groupId={id} post={p} />
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* ── Teachers ── */}
              {tab === "teachers" && (
                <div className="space-y-3">
                  {/* Header with add button */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {tLoading ? "جارٍ التحميل..." : `${teachersList.length} مدرس`}
                    </p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90"
                      onClick={() => setShowAddTeacher(true)}
                    >
                      <UserPlus className="size-3.5" />
                      إضافة مدرس
                    </Button>
                  </div>

                  {tLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-border/60 bg-card">
                        <ListRowSkeleton cols={3} />
                      </div>
                    ))
                  ) : teachersList.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <p className="text-3xl mb-2">👨‍🏫</p>
                      <p className="text-sm text-muted-foreground">لا يوجد مدرسون مسجّلون</p>
                      <Button
                        size="sm"
                        className="mt-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:opacity-90"
                        onClick={() => setShowAddTeacher(true)}
                      >
                        <Plus className="size-3.5" />إضافة مدرس
                      </Button>
                    </div>
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
                          <button
                            onClick={() => setRemoveTarget({ id: tid, name: t.name })}
                            className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20 shrink-0"
                            aria-label="إزالة المدرس"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
