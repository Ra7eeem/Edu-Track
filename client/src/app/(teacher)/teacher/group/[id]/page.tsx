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
import { saveAttendanceAction } from "@/features/teacher/actions/attendance.action"
import { createPostAction, deletePostAction, toggleLikeAction } from "@/features/teacher/actions/post.action"
import { removeStudentAction } from "@/features/teacher/actions/student.action"
import { useGroupPosts } from "@/features/teacher/hooks/use-group-posts"
import { useGroupRanking } from "@/features/teacher/hooks/use-group-ranking"
import { useTeacherGroups, useGroupDetails } from "@/features/teacher/hooks/use-teacher-groups"
import {
  useJoinRequests,
  useApproveJoinRequest,
  useRejectJoinRequest,
} from "@/features/teacher/hooks/use-join-requests"
import { resetRankingAction, addBonusAction } from "@/features/teacher/actions/ranking.action"
import { clientFetch } from "@/shared/lib/api-client"
import { cn } from "@/shared/lib/tailwind-cn"
import { PostCommentsSection } from "@/features/teacher/components/post-comments-section"
import { AttendanceRegister } from "@/features/teacher/components/attendance-register"
import {
  resolveId,
  AttendanceStatus,
  JoinRequestStatus,
  type ApiGroup,
  type ApiJoinRequest,
  type ApiPost,
  type ApiRankingEntry,
} from "@/shared/types/api"
import { useGroupStudents, type GroupStudent } from "@/features/teacher/hooks/use-group-students"
import {
  BarChart3, Bell, BookOpen, CalendarCheck,
  AlertTriangle, CheckCircle2, Clock, ClipboardList, Gift, Heart, MessageCircle, MoreVertical,
  PenLine, Plus, RefreshCcw, RotateCcw, Save, Search,
  Trash2, Trophy, Users, X, XCircle,
} from "lucide-react"
import Link from "next/link"
import { use, useMemo, useState, useTransition } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const TABS = [
  { key: "overview",      label: "نظرة عامة",        icon: BarChart3     },
  { key: "students",      label: "الطلاب",             icon: Users         },
  { key: "attendance",    label: "الحضور",             icon: CalendarCheck },
  { key: "register",      label: "كشاف الغياب",        icon: ClipboardList },
  { key: "posts",         label: "المنشورات",          icon: BookOpen      },
  { key: "ranking",       label: "الترتيب",            icon: Trophy        },
  { key: "join-requests", label: "طلبات الانضمام",     icon: Bell          },
  { key: "assignments",   label: "الواجبات",           icon: ClipboardList },
]

const MEDALS = ["🥇", "🥈", "🥉"]
const ARABIC_MONTHS = [
  "", "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]

// ─── Attendance sub-component ──────────────────────────────────────────────────
function AttendanceTab({ groupId, students }: { groupId: string; students: GroupStudent[] }) {
  const qc = useQueryClient()
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus | "none">>(
    Object.fromEntries(students.map(s => [resolveId(s), "none"]))
  )
  const [search,    setSearch]    = useState("")
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(
    () => students.filter(s => s.name?.includes(search) ?? false),
    [students, search]
  )

  const present = Object.values(attendance).filter(v => v === AttendanceStatus.PRESENT).length
  const late    = Object.values(attendance).filter(v => v === AttendanceStatus.LATE).length
  const absent  = Object.values(attendance).filter(v => v === AttendanceStatus.ABSENT).length
  const pending = students.length - present - late - absent

  const mark = (sid: string, status: AttendanceStatus) =>
    setAttendance(p => ({ ...p, [sid]: p[sid] === status ? "none" : status }))

  const markAll = (status: AttendanceStatus) =>
    setAttendance(Object.fromEntries(students.map(s => [resolveId(s), status])))

  const reset = () => {
    setAttendance(Object.fromEntries(students.map(s => [resolveId(s), "none"])))
    setSaved(false); setError(null)
  }

  const today = new Date().toISOString().split("T")[0]

  const handleSave = () => {
    const records = students.map(s => ({
      studentId: resolveId(s),
      status: attendance[resolveId(s)] === "none"
        ? AttendanceStatus.ABSENT
        : (attendance[resolveId(s)] as AttendanceStatus),
    }))
    startTransition(async () => {
      const res = await saveAttendanceAction(groupId, today, records)
      if (res.success) {
        setSaved(true)
        // Force immediate refetch of ranking — scores update after attendance
        qc.invalidateQueries({
          queryKey:    ["groups", groupId, "ranking"],
          exact:       false,
          refetchType: "active",   // refetch right now if RankingTab is open
        })
      } else {
        setError(res.error ?? "حدث خطأ")
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Stats bar */}
      <div className="rounded-2xl border border-border/60 bg-card p-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-bold">{students.length} طالب</span>
          <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="size-4"/>{present} حاضر</span>
          <span className="flex items-center gap-1 text-amber-600"><Clock className="size-4"/>{late} متأخر</span>
          <span className="flex items-center gap-1 text-rose-600"><XCircle className="size-4"/>{absent} غائب</span>
          {pending > 0 && <span className="text-xs text-muted-foreground">{pending} لم يُسجَّل</span>}
          <Button size="sm" variant="ghost" onClick={reset} className="ms-auto text-muted-foreground">
            <RotateCcw className="size-3.5"/>
          </Button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted flex">
          <div className="h-full bg-emerald-500 transition-all"
               style={{ width: students.length ? `${(present / students.length) * 100}%` : "0%" }}/>
          <div className="h-full bg-amber-400 transition-all"
               style={{ width: students.length ? `${(late / students.length) * 100}%` : "0%" }}/>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن طالب..."
          className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"/>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <button onClick={() => markAll(AttendanceStatus.PRESENT)}
          className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
          ✓ تحضير الكل
        </button>
        <button onClick={() => markAll(AttendanceStatus.LATE)}
          className="flex-1 rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          ⏰ تأخر الكل
        </button>
        <button onClick={() => markAll(AttendanceStatus.ABSENT)}
          className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
          ✗ غياب الكل
        </button>
      </div>

      {/* Students list */}
      <div className="space-y-2">
        {filtered.map(s => {
          const sid    = resolveId(s)
          const name   = s.name ?? "طالب"
          const avatar = name.length > 0 ? name.slice(0,1) : "؟"
          const status = attendance[sid]
          return (
            <div key={sid}
              className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                status === AttendanceStatus.PRESENT ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20"
                : status === AttendanceStatus.LATE    ? "border-amber-200 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-950/20"
                : status === AttendanceStatus.ABSENT  ? "border-rose-200 bg-rose-50/60 dark:border-rose-800/50 dark:bg-rose-950/20"
                : "border-border/60 bg-card")}>
              <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                {avatar}
              </span>
              <span className="flex-1 text-sm font-medium truncate">{name}</span>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => mark(sid, AttendanceStatus.PRESENT)}
                  className={cn("rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all",
                    status === AttendanceStatus.PRESENT ? "bg-emerald-500 text-white shadow-sm"
                    : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400")}>
                  حاضر
                </button>
                <button onClick={() => mark(sid, AttendanceStatus.LATE)}
                  className={cn("rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all",
                    status === AttendanceStatus.LATE ? "bg-amber-500 text-white shadow-sm"
                    : "border border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400")}>
                  متأخر
                </button>
                <button onClick={() => mark(sid, AttendanceStatus.ABSENT)}
                  className={cn("rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all",
                    status === AttendanceStatus.ABSENT ? "bg-rose-500 text-white shadow-sm"
                    : "border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400")}>
                  غائب
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="sticky bottom-20 md:bottom-4">
        {saved ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg">
            <CheckCircle2 className="size-5"/> تم حفظ الحضور بنجاح!
          </div>
        ) : (
          <Button size="lg" className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg hover:opacity-90 disabled:opacity-50"
            disabled={isPending} onClick={handleSave}>
            <Save className="size-4"/>
            {isPending ? "جارٍ الحفظ..." : "حفظ الحضور"}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Posts sub-component ───────────────────────────────────────────────────────
function PostsTab({ groupId, authorName }: { groupId: string; authorName: string }) {
  const qc = useQueryClient()
  const { data, isLoading } = useGroupPosts(groupId)
  const posts: ApiPost[] = (() => {
    if (!data) return []
    if (Array.isArray(data)) return data as ApiPost[]
    if (typeof data === "object" && "data" in (data as object))
      return ((data as { data: ApiPost[] }).data) ?? []
    return []
  })()

  const [content,     setContent]     = useState("")
  const [showCompose, setShowCompose] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [isPending,   startTransition] = useTransition()

  const handleCreate = () => {
    if (!content.trim()) return
    setError(null)
    startTransition(async () => {
      const res = await createPostAction(groupId, content.trim())
      if (res.success) { setContent(""); setShowCompose(false); qc.invalidateQueries({ queryKey: ["groups", groupId, "posts"] }) }
      else setError(res.error ?? "حدث خطأ")
    })
  }

  const handleDelete = (postId: string) => {
    if (!confirm("حذف المنشور؟")) return
    startTransition(async () => { await deletePostAction(groupId, postId); qc.invalidateQueries({ queryKey: ["groups", groupId, "posts"] }) })
  }

  const handleLike = (postId: string) => {
    startTransition(async () => { await toggleLikeAction(groupId, postId); qc.invalidateQueries({ queryKey: ["groups", groupId, "posts"] }) })
  }

  if (isLoading) return <div className="space-y-4">{Array.from({length:3}).map((_,i)=><PostCardSkeleton key={i}/>)}</div>

  return (
    <div className="space-y-4">
      {/* Compose */}
      {!showCompose ? (
        <button onClick={() => setShowCompose(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-sm text-primary/70 hover:border-primary/70 hover:text-primary transition-all">
          <PenLine className="size-4 shrink-0"/>ما الذي تريد مشاركته مع طلابك؟
        </button>
      ) : (
        <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="اكتب منشورك هنا..." rows={4} autoFocus
            className="w-full resize-none rounded-xl bg-muted/40 p-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"/>
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setShowCompose(false); setContent(""); setError(null) }}>إلغاء</Button>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={handleCreate} disabled={isPending || !content.trim()}>
              <Plus className="size-3.5"/>{isPending ? "جارٍ النشر..." : "نشر"}
            </Button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-medium">لا توجد منشورات بعد</p>
          <p className="mt-1 text-sm text-muted-foreground">كن أول من ينشر في هذه المجموعة!</p>
        </div>
      ) : posts.map((p: ApiPost) => {
        const pid    = resolveId(p)
        const author = p.author as { name?: string } | undefined
        return (
          <article key={pid} className="rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between px-4 pt-4">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-teal-100 text-sm font-bold text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                  {(author?.name ?? authorName)[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">{author?.name ?? authorName}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(pid)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
                <Trash2 className="size-4"/>
              </button>
            </div>
            <p className="px-4 pt-3 pb-4 text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
            <div className="flex items-center gap-4 border-b border-border/40 px-4 py-3 text-xs text-muted-foreground">
              <button onClick={() => handleLike(pid)} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Heart className={cn("size-3.5", p.isLiked && "fill-primary text-primary")}/>{p.likeCount ?? 0} إعجاب
              </button>
            </div>
            <PostCommentsSection groupId={groupId} post={p} />
          </article>
        )
      })}
    </div>
  )
}

// ─── Ranking sub-component ─────────────────────────────────────────────────────
function RankingTab({ groupId }: { groupId: string }) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()
  const { data, isLoading } = useGroupRanking(groupId, month, year)
  const ranking = data?.ranking ?? []
  const qc = useQueryClient()

  const [bonusTarget, setBonusTarget]  = useState<{ id: string; name: string } | null>(null)
  const [showReset,   setShowReset]    = useState(false)
  const [bonusVal,    setBonusVal]     = useState("")
  const [bonusErr,    setBonusErr]     = useState<string | null>(null)
  const [resetErr,    setResetErr]     = useState<string | null>(null)
  const [isPending,   startTransition] = useTransition()

  const handleBonus = () => {
    const val = Number(bonusVal)
    if (!val || val <= 0 || !bonusTarget) { setBonusErr("أدخل رقماً موجباً"); return }
    setBonusErr(null)
    startTransition(async () => {
      const res = await addBonusAction(groupId, bonusTarget.id, val, month, year)
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["groups", groupId, "ranking"], exact: false, refetchType: "active" })
        setBonusTarget(null); setBonusVal("")
      } else { setBonusErr(res.error ?? "حدث خطأ") }
    })
  }

  const handleReset = () => {
    setResetErr(null)
    startTransition(async () => {
      const res = await resetRankingAction(groupId, month, year)
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["groups", groupId, "ranking"], exact: false, refetchType: "active" })
        setShowReset(false)
      } else { setResetErr(res.error ?? "حدث خطأ") }
    })
  }

  if (isLoading) return <div className="space-y-2">{Array.from({length:6}).map((_,i)=><RankRowSkeleton key={i}/>)}</div>

  return (
    <>
      {/* Bonus Modal */}
      {bonusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <p className="text-sm font-bold flex items-center gap-2"><Gift className="size-4 text-amber-500"/>نقاط مكافأة لـ {bonusTarget.name}</p>
              <button onClick={() => { setBonusTarget(null); setBonusVal(""); setBonusErr(null) }}
                className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted"><X className="size-4"/></button>
            </div>
            <div className="p-5 space-y-3">
              {bonusErr && <p className="text-xs text-destructive">{bonusErr}</p>}
              <input type="number" min="1" value={bonusVal} onChange={e => setBonusVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBonus()}
                placeholder="عدد النقاط (مثل: 5)" autoFocus
                className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"/>
            </div>
            <div className="flex gap-2 border-t border-border/60 px-5 py-4">
              <Button variant="outline" className="flex-1" onClick={() => { setBonusTarget(null); setBonusVal("") }}>إلغاء</Button>
              <Button className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:opacity-90"
                onClick={handleBonus} disabled={isPending}>
                <Gift className="size-4"/>{isPending ? "..." : "إضافة"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset confirm */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">🔄</p>
            <p className="font-bold">تصفير الترتيب؟</p>
            <p className="text-sm text-muted-foreground">سيُصفَّر ترتيب {ARABIC_MONTHS[month]} {year} للجميع</p>
            {resetErr && <p className="text-xs text-destructive">{resetErr}</p>}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowReset(false)}>إلغاء</Button>
              <Button variant="destructive" className="flex-1" onClick={handleReset} disabled={isPending}>
                {isPending ? "جارٍ التصفير..." : "تأكيد التصفير"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold">ترتيب {ARABIC_MONTHS[month]} {year}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{ranking.length} طالب</span>
            <Button size="sm" variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800"
              onClick={() => setShowReset(true)}>
              <RefreshCcw className="size-3.5"/>تصفير
            </Button>
          </div>
        </div>

        {ranking.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-medium">لا يوجد ترتيب بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">سيظهر الترتيب بعد تسجيل الحضور</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {ranking.length >= 2 && (() => {
              const top3 = ranking.slice(0, 3)
              return (
                <div className="mb-4 grid grid-cols-3 items-end gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/10 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
                  {([top3[1], top3[0], top3[2]] as (ApiRankingEntry|undefined)[]).map((entry, i) => {
                    if (!entry) return <div key={i}/>
                    const pos = i===0?2:i===1?1:3
                    const heights = ["h-20","h-28","h-16"]
                    const podColor = pos===1 ? "bg-gradient-to-t from-amber-400 to-amber-300"
                      : pos===2 ? "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600"
                      : "bg-gradient-to-t from-amber-700/60 to-amber-600/50"
                    return (
                      <div key={resolveId(entry.student)} className={cn("flex flex-col items-center gap-1", i===1 && "-mt-3")}>
                        <span className="text-2xl">{MEDALS[pos-1]}</span>
                        <span className="grid size-10 place-items-center rounded-2xl bg-white text-sm font-bold text-violet-600 shadow-sm dark:bg-card">{entry.student.name[0]}</span>
                        <p className="text-center text-[10px] font-semibold leading-tight">{entry.student.name.split(" ")[0]}</p>
                        <p className="text-[10px] text-muted-foreground">{entry.score} نقطة</p>
                        <div className={cn("w-full rounded-t-xl", heights[i], podColor)}/>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Full list */}
            <div className="space-y-2">
              {ranking.map((entry: ApiRankingEntry) => {
                const sid = resolveId(entry.student)
                return (
                  <div key={sid} className={cn("flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                    entry.rank<=3 ? "border-amber-200/60 bg-amber-50/30 dark:border-amber-800/30 dark:bg-amber-950/10" : "border-border/60 bg-card")}>
                    <span className="w-7 text-center shrink-0">
                      {entry.rank<=3 ? MEDALS[entry.rank-1] : <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>}
                    </span>
                    <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{entry.student.name[0]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.student.name}</p>
                      <div className="flex gap-2 mt-0.5 text-[10px] text-muted-foreground">
                        <span className="text-emerald-600">{entry.presentCount} حضور</span>
                        {(entry as ApiRankingEntry & { lateCount?: number }).lateCount ? <span className="text-amber-600">{(entry as ApiRankingEntry & { lateCount?: number }).lateCount} متأخر</span> : null}
                        {entry.bonusPoints > 0 && <span className="text-violet-600">+{entry.bonusPoints} مكافأة</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setBonusTarget({ id: sid, name: entry.student.name }); setBonusVal("") }}
                        className="grid size-7 place-items-center rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors dark:border-amber-800 dark:hover:bg-amber-950/20"
                        title="إضافة نقاط مكافأة"><Gift className="size-3.5"/></button>
                      <p className="text-sm font-bold text-primary min-w-[2.5rem] text-end">{entry.score}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── Join Requests sub-component ──────────────────────────────────────────────
function JoinRequestsTab({ groupId }: { groupId: string }) {
  const { data: allRequests = [], isLoading } = useJoinRequests()
  const approveMut = useApproveJoinRequest()
  const rejectMut  = useRejectJoinRequest()

  // Filter to only requests belonging to this group
  const requests = allRequests.filter(r => {
    const gid = (r.group as { _id?: string; id?: string } | undefined)
    return gid ? (resolveId(gid) === groupId) : false
  })

  const pending  = requests.filter(r => r.status === JoinRequestStatus.PENDING)
  const resolved = requests.filter(r => r.status !== JoinRequestStatus.PENDING)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-border/60 bg-muted" />
        ))}
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="text-4xl mb-3">📬</p>
        <p className="font-medium">لا توجد طلبات انضمام</p>
        <p className="mt-1 text-sm text-muted-foreground">ستظهر هنا طلبات الطلاب للانضمام إلى مجموعتك</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Pending */}
      {pending.length > 0 && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-600">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40">
              {pending.length}
            </span>
            في انتظار الموافقة
          </h3>
          <div className="space-y-2">
            {pending.map((req: ApiJoinRequest) => {
              const rid     = resolveId(req)
              const student = req.student as { name?: string; email?: string; grade?: string } | undefined
              const name    = student?.name  ?? "طالب"
              const email   = student?.email ?? ""
              const isApproving = approveMut.isPending && approveMut.variables === rid
              const isRejecting = rejectMut.isPending  && rejectMut.variables  === rid
              return (
                <div
                  key={rid}
                  className="flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/40 px-4 py-3 dark:border-amber-800/30 dark:bg-amber-950/10"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
                    {name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                    <p className="truncate text-xs text-muted-foreground">{student?.grade}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(req.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => rejectMut.mutate(rid)}
                      disabled={isApproving || isRejecting}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400"
                    >
                      {isRejecting ? "..." : "رفض"}
                    </button>
                    <button
                      onClick={() => approveMut.mutate(rid)}
                      disabled={isApproving || isRejecting}
                      className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isApproving ? "..." : "قبول"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <section>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            السابقة ({resolved.length})
          </h3>
          <div className="space-y-2">
            {resolved.map((req: ApiJoinRequest) => {
              const rid     = resolveId(req)
              const student = req.student as { name?: string; email?: string } | undefined
              const name    = student?.name  ?? "طالب"
              const email   = student?.email ?? ""
              const approved = req.status === JoinRequestStatus.APPROVED
              return (
                <div
                  key={rid}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 opacity-80"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-muted text-sm font-bold text-muted-foreground shrink-0">
                    {name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                      approved
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}
                  >
                    {approved ? "✓ مقبول" : "✗ مرفوض"}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function GroupManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tab,          setTab]          = useState("overview")
  const [search,       setSearch]       = useState("")
  const [deleteTarget, setDeleteTarget] = useState<{ studentId: string; name: string } | null>(null)
  const [removeErr,    setRemoveErr]    = useState<string | null>(null)
  const [isPending,    startTransition] = useTransition()
  const qc = useQueryClient()

  // Fetch group details directly by ID (reliable, no list-search needed)
  const { data: groupDetails, isLoading: gLoading } = useGroupDetails(id)
  const group = groupDetails?.group ?? null

  // Students
  const { data: studentsData, isLoading: sLoading } = useGroupStudents(id, search)
  const students: GroupStudent[] = studentsData ?? []

  // Session info for author name
  const { data: sessionData } = useQuery({
    queryKey: ["session"],
    queryFn:  () => clientFetch<{ name: string; role: string }>("/api/teacher/profile"),
    staleTime: Infinity,
  })
  const authorName = sessionData?.name ?? "المدرس"

  const unread = 0

  const handleRemove = (studentId: string) => {
    if (!deleteTarget) return
    setRemoveErr(null)
    startTransition(async () => {
      const res = await removeStudentAction(id, studentId)
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["teacher", "groups", id, "students"], exact: false, refetchType: "active" })
        qc.invalidateQueries({ queryKey: ["groups", id, "ranking"], exact: false, refetchType: "active" })
        setDeleteTarget(null)
      } else {
        setRemoveErr(res.error ?? "حدث خطأ أثناء الحذف")
      }
    })
  }

  return (
    <div className="flex flex-col">

      {/* ── Delete Student Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-rose-600">
                <Trash2 className="size-4" />حذف الطالب
              </h2>
              <button
                onClick={() => { setDeleteTarget(null); setRemoveErr(null) }}
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
                  <span className="font-bold text-foreground">{deleteTarget.name}</span>{" "}
                  من المجموعة نهائياً
                </p>
              </div>
              {removeErr && (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
                  {removeErr}
                </p>
              )}
            </div>
            <div className="flex gap-2 border-t border-border/60 px-5 py-4">
              <Button
                variant="outline" className="flex-1"
                onClick={() => { setDeleteTarget(null); setRemoveErr(null) }}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90"
                onClick={() => handleRemove(deleteTarget.studentId)}
                disabled={isPending}
              >
                <Trash2 className="size-3.5" />
                {isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <TopBar
        title={gLoading ? "جارٍ التحميل..." : (group?.name ?? "إدارة المجموعة")}
        subtitle={group?.description ?? undefined}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={authorName}
        userAvatar={authorName[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      {/* Group actions */}
      <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-wrap gap-2">
          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
            <Link href={`/teacher/group/${id}/attendance`}><CalendarCheck className="size-3.5"/>تسجيل حضور منفصل</Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl overflow-x-auto px-4 py-2 sm:px-6">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn("flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  tab===t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
                <t.icon className="size-3.5"/>{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">

        {/* ── Overview ── */}
        {tab === "overview" && (
          gLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({length:3}).map((_,i)=><StatCardSkeleton key={i}/>)}
            </div>
          ) : !group ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-4xl mb-3">😕</p>
              <p className="font-medium text-muted-foreground">المجموعة غير موجودة أو لا تملك صلاحية الوصول</p>
              <Button className="mt-4" variant="outline" asChild><Link href="/teacher/groups">العودة للمجموعات</Link></Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { l: "الطلاب",    v: students.length,  c: "text-violet-600"  },
                  { l: "المنشورات", v: "—",              c: "text-cyan-600"    },
                  { l: "الحالة",    v: group.isActive ? "نشطة" : "موقوفة", c: group.isActive ? "text-emerald-600" : "text-rose-600" },
                ].map(s => (
                  <div key={s.l} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <p className={`text-xl font-extrabold ${s.c}`}>{s.v}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
              {group.description && (
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <h3 className="mb-1 text-sm font-bold">عن المجموعة</h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "تسجيل الحضور",   href: `/teacher/group/${id}/attendance`, color: "from-emerald-600 to-emerald-500", icon: CalendarCheck },
                  { label: "كشف الغياب",     href: `/teacher/group/${id}/register`,   color: "from-violet-600 to-violet-500",  icon: ClipboardList  },
                  { label: "الطلاب",          tab: "students",   color: "from-cyan-600 to-cyan-500",    icon: Users           },
                  { label: "الترتيب",         tab: "ranking",    color: "from-amber-600 to-amber-500",  icon: Trophy          },
                ].map(a => (
                  a.href ? (
                    <Link key={a.label} href={a.href}
                      className={`flex items-center gap-2.5 rounded-2xl bg-gradient-to-r ${a.color} p-4 text-white shadow-sm hover:opacity-90 transition-opacity`}>
                      <a.icon className="size-4 shrink-0"/>
                      <span className="text-sm font-semibold">{a.label}</span>
                    </Link>
                  ) : (
                    <button key={a.label} onClick={() => setTab(a.tab!)}
                      className={`flex items-center gap-2.5 rounded-2xl bg-gradient-to-r ${a.color} p-4 text-white shadow-sm hover:opacity-90 transition-opacity`}>
                      <a.icon className="size-4 shrink-0"/>
                      <span className="text-sm font-semibold">{a.label}</span>
                    </button>
                  )
                ))}
              </div>
            </div>
          )
        )}

        {/* ── Students ── */}
        {tab === "students" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..."
                  className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"/>
              </div>
              <Button size="sm" className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
                <Link href={`/teacher/group/${id}/students`}><Users className="size-3.5"/>إضافة طالب</Link>
              </Button>
            </div>

            {sLoading ? (
              Array.from({length:5}).map((_,i)=>(
                <div key={i} className="rounded-2xl border border-border/60 bg-card"><ListRowSkeleton cols={4}/></div>
              ))
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-3xl mb-2">👤</p>
                <p className="text-sm text-muted-foreground">لا يوجد طلاب في هذه المجموعة بعد</p>
              </div>
            ) : students.map((s: GroupStudent, i: number) => {
              const sid    = resolveId(s)
              const name   = s.name ?? "طالب"
              const email  = s.email ?? ""
              const avatar = name.length > 0 ? name[0] : "؟"
              return (
                <div key={sid} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
                  <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                    {avatar}
                  </span>
                  <Link href={`/teacher/group/${id}/students/${sid}`} className="min-w-0 flex-1 hover:underline underline-offset-2 decoration-muted-foreground/50">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{email}</p>
                  </Link>
                  <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">#{i + 1}</span>
                  <button
                    onClick={() => { setRemoveErr(null); setDeleteTarget({ studentId: sid, name }) }}
                    className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20 shrink-0"
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
          sLoading ? (
            <div className="space-y-2">{Array.from({length:5}).map((_,i)=><div key={i} className="rounded-2xl border border-border/60 bg-card"><ListRowSkeleton/></div>)}</div>
          ) : (
            <AttendanceTab groupId={id} students={students}/>
          )
        )}

        {/* ── Register (كشاف) ── */}
        {tab === "register" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">سجل الحضور الشهري لجميع الطلاب</p>
              <Link href={`/teacher/group/${id}/register`}
                className="text-xs text-primary hover:underline">
                فتح في صفحة كاملة ↗
              </Link>
            </div>
            <AttendanceRegister groupId={id} role="teacher"/>
          </div>
        )}

        {/* ── Posts ── */}
        {tab === "posts" && <PostsTab groupId={id} authorName={authorName}/>}

        {/* ── Ranking ── */}
        {tab === "ranking" && <RankingTab groupId={id}/>}

        {/* ── Join Requests ── */}
        {tab === "join-requests" && <JoinRequestsTab groupId={id}/>}

        {/* ── Assignments ── */}
        {tab === "assignments" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-4xl">📚</p>
            <p className="font-medium">إدارة الواجبات والامتحانات</p>
            <p className="text-sm text-muted-foreground">
              أضف واجبات وامتحانات مع وصف ورابط يوتيوب وتاريخ تسليم
            </p>
            <Link
              href={`/teacher/group/${id}/assignments`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              <ClipboardList className="size-4" />
              فتح صفحة الواجبات
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
