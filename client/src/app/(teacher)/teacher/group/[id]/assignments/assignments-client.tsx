"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import {
  deleteAssignmentAction,
  toggleAssignmentResultsAction,
  toggleAssignmentVisibilityAction,
} from "@/features/teacher/actions/assignment.action"
import { toArray } from "@/shared/lib/api-helpers"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiExamSubmission, ApiQuestion,
  AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Eye, EyeOff, BarChart2, Plus, Trash2, Users, X, XCircle, Pencil, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// ─── Submissions Modal ────────────────────────────────────────────────────────
function SubmissionsModal({
  groupId,
  assignmentId,
  title,
  assignment,
  onClose,
}: {
  groupId: string
  assignmentId: string
  title: string
  assignment: ApiAssignment
  onClose: () => void
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Fetch full assignment if questions are missing or incomplete to guarantee questions never disappear
  const { data: fullAssignment } = useQuery({
    queryKey: ["assignment-detail", assignmentId],
    queryFn: () => clientFetch<ApiAssignment>(`/api/assignments/${assignmentId}`),
    enabled: !!assignmentId && (!assignment.questions || assignment.questions.length === 0),
    placeholderData: (prev) => prev,
  })

  const targetAssignment = fullAssignment || assignment

  const questionsMap: Record<string, ApiQuestion> = {}
  for (const q of targetAssignment.questions ?? []) {
    if (q._id) questionsMap[String(q._id)] = q
    if ((q as any).id) questionsMap[String((q as any).id)] = q
  }

  const { data: raw, isLoading } = useQuery({
    queryKey: ["exam-submissions", assignmentId],
    queryFn: () =>
      clientFetch<{ data: ApiExamSubmission[] }>(
        `/api/assignments/${assignmentId}/submissions?limit=100`
      ),
    enabled: !!assignmentId,
    placeholderData: (prev) => prev,
    refetchInterval: 15_000,
  })

  const submissions: ApiExamSubmission[] = (() => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiExamSubmission[]
    if (typeof raw === "object" && "data" in raw) return (raw as { data: ApiExamSubmission[] }).data ?? []
    return []
  })()

  const filteredSubmissions = submissions.filter(sub => {
    if (!search.trim()) return true
    const name = (sub.student as { name?: string })?.name?.toLowerCase() ?? ""
    return name.includes(search.trim().toLowerCase())
  })

  const selectedSub = selected ? submissions.find(s =>
    (resolveId(s as { _id?: string; id?: string })) === selected
  ) : null

  function enrichAnswers(sub: ApiExamSubmission) {
    const backendDetailsMap: Record<string, any> = {}
    if (Array.isArray((sub as any).answersWithDetails)) {
      for (const d of (sub as any).answersWithDetails) {
        if (d?.questionId) backendDetailsMap[String(d.questionId)] = d
      }
    }

    return (sub.answers ?? []).map((a, idx) => {
      const q = questionsMap[String(a.questionId)]
      const backendDetail = backendDetailsMap[String(a.questionId)]
      const chosenChoice = q?.choices?.find(c => c.id === a.chosen || String(c.id) === String(a.chosen))
      const correctChoice = q?.choices?.find(c => c.id === (q?.correctAnswer ?? backendDetail?.correctAnswer) || String(c.id) === String(q?.correctAnswer ?? backendDetail?.correctAnswer))

      const questionText = q?.text || backendDetail?.questionText || `سؤال ${idx + 1}`
      const correctAnswer = q?.correctAnswer || backendDetail?.correctAnswer || ""
      const points = q?.points ?? backendDetail?.points ?? 1
      const isCorrect = q
        ? (q.correctAnswer ? String(a.chosen).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase() : undefined)
        : (backendDetail?.isCorrect ?? (correctAnswer ? String(a.chosen).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase() : undefined))

      return {
        questionId: a.questionId,
        chosen: a.chosen,
        chosenText: chosenChoice?.text ?? "",
        questionText,
        correctAnswer,
        correctText: correctChoice?.text ?? "",
        points,
        isCorrect,
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm p-2 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex h-full max-h-[94dvh] w-full max-w-lg flex-col overflow-auto rounded-3xl border border-slate-700/50 bg-background  shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-800/70 px-5 py-4 shrink-0 gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white">إجابات ونتائج الطلاب</h2>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{title}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { onClose(); router.push(`/teacher/group/${groupId}/assignments/${assignmentId}/edit`) }}
              className="grid size-9 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title="تعديل الامتحان"
            >
              <Pencil className="size-4" />
            </button>
            <button onClick={onClose} className="grid size-9 place-items-center rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors" title="إغلاق">
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        {!selectedSub ? (
          /* ─── Screen 1: Students List ─── */
          <div className="flex-1 min-h-0 h-full overflow-y-auto overscroll-contain touch-pan-y">
            {/* Sub-header */}
            <div className="flex items-center justify-between text-xs px-5 py-3 border-b border-slate-800/40">
              <span className="font-bold text-slate-300">الطلاب المسلمون</span>
              <span className="text-slate-500">{filteredSubmissions.length} طالب</span>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-1">
              <div className="relative">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث باسم الطالب..."
                  className="w-full text-xs rounded-xl border border-slate-700/60 bg-slate-800/40 px-4 py-2.5  placeholder-slate-500 outline-none focus:border-primary transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 ">
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="px-4 py-3 space-y-2.5 pb-10 h-full overflow-auto">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-slate-800/40 border border-slate-700/30" />
                ))
              ) : filteredSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Users className="size-10 text-slate-600 mb-3" />
                  <p className="text-xs text-slate-500">{search ? "لا توجد نتائج مطابقة" : "لا توجد إجابات بعد"}</p>
                </div>
              ) : (
                filteredSubmissions.map(sub => {
                  const sid = resolveId(sub as { _id?: string; id?: string })
                  const total = sub.total ?? 0
                  const score = sub.score ?? 0
                  const pct = total ? Math.round((score / total) * 100) : 0
                  const st = sub.student as { name?: string } | undefined
                  return (
                    <button
                      key={sid}
                      onClick={() => setSelected(sid)}
                      className="w-full rounded-2xl px-4 py-3.5 text-start flex items-center gap-3 mb-4 border border-slate-700/40 bg-slate-800/30 hover:bg-slate-700/30 hover:border-slate-600/50 transition-all"
                    >
                      {/* Percentage badge */}
                      <span className={cn(
                        "shrink-0 min-w-[40px] text-center rounded-md px-1.5 py-0.5 text-[11px] font-extrabold",
                        pct >= 50
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      )}>
                        {pct}%
                      </span>

                      {/* Name & score */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold break-words leading-snug">{st?.name ?? "طالب"}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {score} / {total}{" "}({pct}%)
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* ─── Screen 2: Student Answers ─── */
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
            <div className="px-4 py-3 space-y-4 pb-16">
              {/* Back button */}
              <button
                onClick={() => setSelected(null)}
                className="w-full flex items-center gap-2 text-xs font-bold text-slate-300 transition-colors py-1"
              >
                <ArrowRight className="size-4 shrink-0" />
                <span>العودة لقائمة الطلاب ({submissions.length})</span>
              </button>

              {/* Score summary */}
              <div className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  {/* Score on start side (right in RTL) */}
                  <div className="shrink-0 flex flex-col items-center">
                    <p className="text-3xl font-black leading-none">
                      {selectedSub.total ?? 0} <span className="text-lg text-slate-400 font-bold">/</span> {selectedSub.score ?? 0}
                    </p>
                    <p className={cn(
                      "text-sm font-extrabold mt-1",
                      selectedSub.total && ((selectedSub.score ?? 0) / selectedSub.total) >= 0.5
                        ? "text-emerald-400"
                        : "text-rose-400"
                    )}>
                      {selectedSub.total ? Math.round(((selectedSub.score ?? 0) / selectedSub.total) * 100) : 0}%
                    </p>
                  </div>

                  {/* Student name on end side (left in RTL) */}
                  <div className="min-w-0 flex-1 text-end">
                    <p className="text-[11px] text-slate-400">اسم الطالب</p>
                    <h3 className="text-base font-bold break-words mt-0.5">
                      {(selectedSub.student as { name?: string })?.name ?? "طالب"}
                    </h3>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 border-t border-slate-700/40 pt-2.5">
                  تاريخ التسليم: {new Date(selectedSub.submittedAt).toLocaleDateString("ar-EG", {
                    year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Questions header */}
              <p className="text-xs font-bold text-slate-300 pt-1">تفاصيل الأسئلة والإجابات:</p>

              {/* Question cards */}
              {enrichAnswers(selectedSub).map((ans, i) => (
                <div key={ans.questionId + i} className="rounded-2xl border border-slate-700/40 bg-slate-800/30 p-4 space-y-3">
                  {/* Question row: checkmark · number · text */}
                  <div className="flex items-start gap-2.5">
                    {/* Status icon */}
                    {ans.isCorrect === true ? (
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : ans.isCorrect === false ? (
                      <XCircle className="size-5 text-rose-400 shrink-0 mt-0.5" />
                    ) : (
                      <div className="size-5 shrink-0 mt-0.5 rounded-full border border-slate-600 grid place-items-center text-[10px] text-slate-500 font-bold">?</div>
                    )}

                    {/* Question number + text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-relaxed break-words">
                        <span className="text-slate-400 font-bold me-1.5">{i + 1} {`) `} </span>
                        {ans.questionText}
                      </p>
                    </div>
                  </div>

                  {/* Answer section */}
                  <div className="space-y-2 ps-[30px]">
                    {/* Student's answer */}
                    <div>
                      <p className="text-[11px] text-slate-400 mb-1">إجابة الطالب:</p>
                      <div className={cn(
                        "rounded-lg px-3 py-2 text-sm font-bold",
                        ans.isCorrect === true
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "bg-slate-700/30 text-slate-200 border border-slate-600/30"
                      )}>
                        {ans.chosen}{ans.chosenText ? ` (${ans.chosenText})` : ""}
                      </div>
                    </div>

                    {/* Correct answer if wrong */}
                    {ans.isCorrect === false && ans.correctAnswer && (
                      <div>
                        <p className="text-[11px] text-slate-400 mb-1">الإجابة الصحيحة:</p>
                        <div className="rounded-lg px-3 py-2 text-sm font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {ans.correctAnswer}{ans.correctText ? ` (${ans.correctText})` : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Page client ──────────────────────────────────────────────────────────────
interface AssignmentsClientProps {
  groupId: string
  initialAssignments: ApiAssignment[]
  userName: string
}

export default function AssignmentsClient({
  groupId,
  initialAssignments,
  userName,
}: AssignmentsClientProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewSubs, setViewSubs] = useState<{ id: string; title: string } | null>(null)

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["teacher", "assignments", groupId],
    queryFn: () =>
      clientFetch<PaginatedResponse<ApiAssignment>>(`/api/assignments/group/${groupId}?limit=50`).then(toArray<ApiAssignment>),
    enabled: !!groupId,
    initialData: initialAssignments,
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAssignmentAction(id, groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] })
      setDeleteId(null)
    },
  })

  const toggleMut = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleAssignmentVisibilityAction(id, groupId)
      if ("error" in result) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] }),
  })

  const toggleResultsMut = useMutation({
    mutationFn: async (id: string) => {
      const result = await toggleAssignmentResultsAction(id, groupId)
      if ("error" in result) throw new Error(result.error)
      return result.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] }),
  })

  return (
    <>
      {viewSubs && (
        <SubmissionsModal
          groupId={groupId}
          assignmentId={viewSubs.id}
          title={viewSubs.title}
          assignment={assignments.find(a => resolveId(a as { _id?: string; id?: string }) === viewSubs.id) ?? { questions: [] } as unknown as ApiAssignment}
          onClose={() => setViewSubs(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">🗑️</p>
            <p className="font-bold">حذف الواجب؟</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>إلغاء</Button>
              <Button variant="destructive" className="flex-1" onClick={() => deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <TopBar title="الواجبات والامتحانات" notifHref="/teacher/notifications"
          userName={userName} userAvatar={userName ? userName[0] : "م"} userAvatarColor="bg-primary" profileHref="/teacher/profile" />

        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{isLoading ? "جارٍ التحميل..." : `${assignments.length} عنصر`}</p>
            <Button onClick={() => router.push(`/teacher/group/${groupId}/assignments/new`)} className="bg-primary text-primary-foreground  hover:opacity-90">
              <Plus className="size-4" />إضافة
            </Button>
          </div>

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border/60 bg-muted" />
            ))
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="font-medium">لا توجد واجبات بعد</p>
              <Button className="mt-4 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground" onClick={() => router.push(`/teacher/group/${groupId}/assignments/new`)}>
                <Plus className="size-4" />إضافة أول واجب
              </Button>
            </div>
          ) : (
            assignments.map(a => {
              const aid = resolveId(a as { _id?: string; id?: string })
              const isExam = a.type === AssignmentType.EXAM
              const isOpen = expandedId === aid
              const totalPoints = (a.questions ?? []).reduce((s, q) => s + (q.points ?? 1), 0)

              return (
                <div key={aid} className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden",
                  isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60")}>
                  <div className="p-4 space-y-3">
                    {/* Title and Badges Row */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className={cn("grid size-9 place-items-center rounded-xl shrink-0 text-base mt-0.5",
                          isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-primary/10 dark:bg-primary/20")}>
                          {isExam ? "📝" : "📚"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <span className={cn("text-[10px] rounded-full px-2 py-0.5 font-bold shrink-0",
                              isExam ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary")}>
                              {ASSIGNMENT_TYPE_LABELS[a.type]}
                            </span>
                            {a.durationMinutes && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="size-2.5" />{a.durationMinutes} دقيقة
                              </span>
                            )}
                            {(a.questions ?? []).length > 0 && (
                              <span className="text-[10px] rounded-full px-2 py-0.5 bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary">
                                {a.questions.length} سؤال · {totalPoints} نقطة
                              </span>
                            )}
                            {a.isHidden && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                <EyeOff className="size-2.5" />مخفي
                              </span>
                            )}
                            {isExam && !a.showResults && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 font-bold dark:bg-slate-800/30 dark:text-slate-400">
                                <BarChart2 className="size-2.5" />النتائج مخفية
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-sm sm:text-base text-foreground break-words">{a.title}</h4>
                        </div>
                      </div>

                      {/* Expand Chevron */}
                      {(a.questions ?? []).length > 0 && (
                        <button onClick={() => setExpandedId(isOpen ? null : aid)}
                          className="grid size-8 place-items-center rounded-xl border border-border/60 text-muted-foreground hover:bg-muted transition-colors shrink-0"
                          title={isOpen ? "طي الأسئلة" : "عرض الأسئلة"}>
                          {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Action buttons toolbar - responsive and easy to tap on phones */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                      {isExam && (
                        <button
                          onClick={() => setViewSubs({ id: aid, title: a.title })}
                          className="flex h-8 items-center gap-1 rounded-xl border border-teal-200 bg-teal-50/50 px-2.5 text-teal-700 hover:bg-teal-100 transition-colors dark:border-teal-800 dark:bg-teal-950/20 dark:text-teal-300 text-xs font-semibold"
                          title="عرض نتائج وإجابات الطلاب"
                        >
                          <Users className="size-3.5" />
                          <span>نتائج الطلاب</span>
                        </button>
                      )}
                      {isExam && (
                        <button
                          onClick={() => toggleResultsMut.mutate(aid)}
                          disabled={toggleResultsMut.isPending}
                          className={cn(
                            "flex h-8 items-center gap-1 rounded-xl border px-2.5 text-xs font-semibold transition-colors",
                            a.showResults
                              ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                              : "border-amber-200 bg-amber-50/50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
                          )}
                          title={a.showResults ? "النتائج ظاهرة للطلاب — اضغط لإخفائها" : "النتائج مخفية — اضغط لإظهارها"}
                        >
                          <BarChart2 className="size-3.5" />
                          <span>{a.showResults ? "إخفاء النتيجة" : "إظهار النتيجة"}</span>
                        </button>
                      )}
                      <button
                        onClick={() => toggleMut.mutate(aid)}
                        disabled={toggleMut.isPending}
                        className={cn(
                          "flex h-8 items-center gap-1 rounded-xl border px-2 text-xs font-medium transition-colors",
                          a.isHidden
                            ? "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/20"
                            : "border-border/60 text-muted-foreground hover:bg-muted"
                        )}
                        title={a.isHidden ? "إظهار للطلاب" : "إخفاء عن الطلاب"}
                      >
                        {a.isHidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        <span className="text-[11px]">{a.isHidden ? "مخفي" : "ظاهر"}</span>
                      </button>
                      <button
                        onClick={() => router.push(`/teacher/group/${groupId}/assignments/${aid}/edit`)}
                        className="flex h-8 items-center gap-1 rounded-xl border border-border/60 px-2 text-xs text-muted-foreground hover:bg-muted hover:text-primary transition-colors "
                        title="تعديل"
                      >
                        <Pencil className="size-3.5" />
                        <span className="text-[11px]">تعديل</span>
                      </button>
                      <button onClick={() => setDeleteId(aid)}
                        className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20"
                        title="حذف">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {a.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2 whitespace-pre-line">{a.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {a.dueDate && (
                        <span>📅 {new Date(a.dueDate).toLocaleDateString("ar-EG", {
                          year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                        })}</span>
                      )}
                      {a.youtubeUrl && (
                        <a href={a.youtubeUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-rose-600 hover:underline">
                          <ExternalLink className="size-3" />مشاهدة الفيديو
                        </a>
                      )}
                      <span className="ms-auto">{new Date(a.createdAt).toLocaleDateString("ar-EG")}</span>
                    </div>
                  </div>

                  {isOpen && (a.questions ?? []).length > 0 && (
                    <div className="border-t border-border/40 bg-muted/20 p-4 space-y-3 max-h-[60vh] overflow-y-auto overscroll-contain">
                      <p className="text-xs font-bold text-muted-foreground mb-2">الأسئلة:</p>
                      {a.questions.map((q, qi) => (
                        <div key={q._id ?? qi} className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="grid size-5 shrink-0 place-items-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary dark:bg-primary/20 dark:text-primary mt-0.5">
                              {qi + 1}
                            </span>
                            <p className="text-sm font-medium leading-snug">{q.text}</p>
                            <span className="ms-auto shrink-0 text-[10px] text-amber-600 font-bold">{q.points} نقطة</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 ps-7">
                            {q.choices.map(c => (
                              <div key={c.id} className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs",
                                c.id === q.correctAnswer
                                  ? "bg-emerald-100 text-emerald-800 font-bold dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-muted text-muted-foreground")}>
                                <span className="font-bold shrink-0">{c.id}</span>
                                <span className="truncate">{c.text}</span>
                                {c.id === q.correctAnswer && <span className="ms-auto shrink-0">✓</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
