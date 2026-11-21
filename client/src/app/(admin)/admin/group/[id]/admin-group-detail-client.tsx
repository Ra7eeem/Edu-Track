"use client"

import { PostCommentsSection } from "@/features/teacher/components/post-comments-section"
import { AttendanceRegister } from "@/features/teacher/components/attendance-register"
import {
  ApiGroup,
  ApiPost,
  ApiRankingEntry,
  ApiUser,
  resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  Heart,
  Plus,
  Trophy,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react"
import { useState } from "react"
import { AddGroupTeacherModal } from "./add-group-teacher-modal"
import { DeleteStudentConfirm, RemoveTeacherConfirm } from "./group-confirm-modals"

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

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function AdminGroupDetailClient({
  groupId,
  group,
  teachers,
  students,
  posts,
  ranking,
  allTeachers,
}: {
  groupId: string
  group: ApiGroup | null
  teachers: ApiUser[]
  students: ApiUser[]
  posts: ApiPost[]
  ranking: ApiRankingEntry[]
  allTeachers: ApiUser[]
}) {
  const [tab,            setTab]            = useState("overview")
  const [showAddTeacher, setShowAddTeacher] = useState(false)
  const [removeTarget,   setRemoveTarget]   = useState<{ id: string; name: string } | null>(null)
  const [deleteStudent,  setDeleteStudent]  = useState<{ id: string; name: string } | null>(null)
  const now = new Date()

  const rankingList  = ranking ?? []
  const postsList    = posts ?? []
  const studentsList = students ?? []
  const teachersList = teachers ?? []
  const top3 = rankingList.slice(0, 3)

  const currentTeacherIds = teachersList.map((t: ApiUser) => resolveId(t))

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
      </div>
    )
  }

  return (
    <>
      {showAddTeacher && (
        <AddGroupTeacherModal
          groupId={groupId}
          allTeachers={allTeachers}
          currentTeacherIds={currentTeacherIds}
          onClose={() => setShowAddTeacher(false)}
        />
      )}

      <RemoveTeacherConfirm
        groupId={groupId}
        teacherId={removeTarget?.id ?? ""}
        teacherName={removeTarget?.name ?? ""}
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
      />

      <DeleteStudentConfirm
        groupId={groupId}
        studentId={deleteStudent?.id ?? ""}
        studentName={deleteStudent?.name ?? ""}
        open={!!deleteStudent}
        onClose={() => setDeleteStudent(null)}
      />

      <div className="flex flex-col">
        {/* Sub-header */}
        <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
          <div className="mx-auto max-w-5xl flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {group.description && <span className="truncate max-w-xs">{group.description}</span>}
            <span className="text-xs ms-auto">
              {group.isActive ? "✅ نشطة" : "⛔ غير نشطة"}
            </span>
          </div>
        </div>

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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="المنشورات" value={postsList.length} color="text-cyan-600" />
                <StatCard label="المدرسون" value={teachersList.length} color="text-amber-600" />
                <StatCard label="عدد الطلاب" value={studentsList.length} color="text-primary" />
                <StatCard label="في الترتيب" value={rankingList.length} color="text-emerald-600" />
              </div>
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-2 text-sm font-bold">عن المجموعة</h3>
                <p className="text-sm text-muted-foreground">{group.description ?? "لا يوجد وصف"}</p>
              </div>
            </div>
          )}

          {/* ── Students ── */}
          {tab === "students" && (
            <div className="space-y-2">
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
                    <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20 dark:text-primary shrink-0">
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
            </div>
          )}

          {/* ── Attendance ── */}
          {tab === "attendance" && (
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <AttendanceRegister groupId={groupId} role="admin"/>
            </div>
          )}

          {/* ── Ranking ── */}
          {tab === "ranking" && (
            <div className="space-y-3">
              {rankingList.length === 0 ? (
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
                            <span className="grid size-10 place-items-center rounded-2xl bg-white text-sm font-bold text-primary shadow-sm dark:bg-card">
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
                        <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20 dark:text-primary shrink-0">
                          {entry.student.name[0]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{entry.student.name}</p>
                          <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
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
              {postsList.length === 0 ? (
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
                      <PostCommentsSection groupId={groupId} post={p} />
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ── Teachers ── */}
          {tab === "teachers" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {teachersList.length} مدرس
                </p>
                <button
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90 transition-opacity"
                  onClick={() => setShowAddTeacher(true)}
                >
                  <UserPlus className="size-3.5" />
                  إضافة مدرس
                </button>
              </div>

              {teachersList.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <p className="text-3xl mb-2">👨‍🏫</p>
                  <p className="text-sm text-muted-foreground">لا يوجد مدرسون مسجّلون</p>
                  <button
                    className="mt-3 flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 px-3 py-2 text-xs font-medium text-white hover:opacity-90"
                    onClick={() => setShowAddTeacher(true)}
                  >
                    <Plus className="size-3.5" />إضافة مدرس
                  </button>
                </div>
              ) : (
                teachersList.map((t: ApiUser) => {
                  const tid = resolveId(t)
                  return (
                    <div
                      key={tid}
                      className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5 shadow-sm"
                    >
                      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary dark:bg-primary/20 dark:text-primary shrink-0">
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
      </div>
    </>
  )
}