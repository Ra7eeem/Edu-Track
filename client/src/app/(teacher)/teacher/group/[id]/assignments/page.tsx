"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiChoice, ApiExamSubmission, ApiQuestion,
  AssignmentType, ASSIGNMENT_TYPE_LABELS,
  PaginatedResponse, resolveId,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ChevronDown, ChevronUp, Clock, ExternalLink, Plus, Trash2, Users, X, XCircle } from "lucide-react"
import { use, useRef, useState } from "react"

function toArray<T>(raw: unknown): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw as T[]
  const r = raw as Record<string, unknown>
  if (Array.isArray(r.data)) return r.data as T[]
  return []
}

// ─── Default choices helper ───────────────────────────────────────────────────
const CHOICE_IDS = ["أ", "ب", "ج", "د"]
function defaultChoices(): ApiChoice[] {
  return CHOICE_IDS.slice(0, 4).map(id => ({ id, text: "" }))
}
function emptyQuestion(idx: number): ApiQuestion & { _localId: number } {
  return { _localId: idx, text: "", choices: defaultChoices(), correctAnswer: "أ", points: 1 }
}

// ─── Question Builder ─────────────────────────────────────────────────────────
function QuestionBuilder({
  questions, onChange,
}: {
  questions: (ApiQuestion & { _localId?: number })[]
  onChange: (q: (ApiQuestion & { _localId?: number })[]) => void
}) {
  const addQ = () => onChange([...questions, emptyQuestion(Date.now())])

  const removeQ = (idx: number) => onChange(questions.filter((_, i) => i !== idx))

  const updateQ = (idx: number, patch: Partial<ApiQuestion>) =>
    onChange(questions.map((q, i) => i === idx ? { ...q, ...patch } : q))

  const updateChoice = (qi: number, ci: number, text: string) =>
    onChange(questions.map((q, i) => {
      if (i !== qi) return q
      const choices = q.choices.map((c, j) => j === ci ? { ...c, text } : c)
      return { ...q, choices }
    }))

  const addChoice = (qi: number) =>
    onChange(questions.map((q, i) => {
      if (i !== qi || q.choices.length >= 6) return q
      const nextId = CHOICE_IDS[q.choices.length] ?? String(q.choices.length + 1)
      return { ...q, choices: [...q.choices, { id: nextId, text: "" }] }
    }))

  const removeChoice = (qi: number, ci: number) =>
    onChange(questions.map((q, i) => {
      if (i !== qi || q.choices.length <= 2) return q
      const choices = q.choices.filter((_, j) => j !== ci)
      // reset correctAnswer if removed
      const correctAnswer = choices.some(c => c.id === q.correctAnswer)
        ? q.correctAnswer : choices[0]?.id ?? "أ"
      return { ...q, choices, correctAnswer }
    }))

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div
          key={q._localId ?? qi}
          className="rounded-2xl border border-violet-200/60 bg-violet-50/30 dark:border-violet-800/30 dark:bg-violet-950/10 p-4 space-y-3"
        >
          {/* Question header */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-violet-700 dark:text-violet-400">
              سؤال {qi + 1}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">النقاط:</span>
              <input
                type="number"
                min={1}
                max={100}
                value={q.points}
                onChange={e => updateQ(qi, { points: Number(e.target.value) || 1 })}
                className="h-7 w-14 rounded-xl border border-input bg-card px-2 text-xs outline-none focus:border-primary"
              />
              <button
                onClick={() => removeQ(qi)}
                className="grid size-7 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Question text */}
          <textarea
            value={q.text}
            onChange={e => updateQ(qi, { text: e.target.value })}
            placeholder={`اكتب السؤال ${qi + 1} هنا...`}
            rows={2}
            className="flex w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />

          {/* Choices */}
          <div className="space-y-2">
            {q.choices.map((c, ci) => (
              <div key={c.id} className="flex items-center gap-2">
                {/* Correct answer radio */}
                <button
                  type="button"
                  onClick={() => updateQ(qi, { correctAnswer: c.id })}
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all",
                    q.correctAnswer === c.id
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border hover:border-emerald-400"
                  )}
                  title="اضغط لتعيين كإجابة صحيحة"
                >
                  {q.correctAnswer === c.id && (
                    <span className="text-[10px] font-bold">✓</span>
                  )}
                </button>

                {/* Choice label */}
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-card border border-border text-xs font-bold">
                  {c.id}
                </span>

                {/* Choice text */}
                <input
                  value={c.text}
                  onChange={e => updateChoice(qi, ci, e.target.value)}
                  placeholder={`الخيار ${c.id}`}
                  className="flex-1 h-9 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
                />

                {/* Remove choice */}
                {q.choices.length > 2 && (
                  <button
                    onClick={() => removeChoice(qi, ci)}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add choice */}
          {q.choices.length < 6 && (
            <button
              onClick={() => addChoice(qi)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Plus className="size-3.5" />إضافة خيار
            </button>
          )}

          {/* Correct answer hint */}
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
            ✓ الإجابة الصحيحة: الخيار {q.correctAnswer}
          </p>
        </div>
      ))}

      <button
        onClick={addQ}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 py-3 text-sm font-medium text-violet-700 hover:bg-violet-100/50 transition-colors dark:border-violet-700 dark:bg-violet-950/20 dark:text-violet-400"
      >
        <Plus className="size-4" />إضافة سؤال
      </button>
    </div>
  )
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateAssignmentModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const qc         = useQueryClient()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [type,            setType]            = useState<AssignmentType>(AssignmentType.HOMEWORK)
  const [title,           setTitle]           = useState("")
  const [description,     setDescription]     = useState("")
  const [youtubeUrl,      setYoutubeUrl]      = useState("")
  const [dueDate,         setDueDate]         = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [questions,       setQuestions]       = useState<(ApiQuestion & { _localId?: number })[]>([])
  const [showQuestions,   setShowQuestions]   = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  const isExam = type === AssignmentType.EXAM

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      clientFetch<ApiAssignment>("/api/assignments", { method: "POST", data: body } as never),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["assignments", groupId] }); onClose() },
  })

  const handleSubmit = async () => {
    if (!title.trim()) { setError("العنوان مطلوب"); return }
    if (isExam) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        if (!q.text.trim()) { setError(`نص السؤال ${i + 1} مطلوب`); return }
        if (q.choices.some(c => !c.text.trim())) { setError(`أكمل نصوص خيارات السؤال ${i + 1}`); return }
        if (!q.choices.some(c => c.id === q.correctAnswer)) {
          setError(`حدد الإجابة الصحيحة للسؤال ${i + 1}`); return
        }
      }
    }
    setError(null)
    try {
      await createMut.mutateAsync({
        groupId,
        type,
        title:           title.trim(),
        description:     description.trim() || undefined,
        youtubeUrl:      youtubeUrl.trim()  || undefined,
        dueDate:         dueDate            || undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        questions:       isExam ? questions.map(({ _localId: _, ...q }) => q) : [],
      })
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "حدث خطأ")
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-2xl rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <h2 className="text-base font-bold">إضافة واجب / امتحان</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

          {/* Type */}
          <div className="flex gap-2">
            {([AssignmentType.HOMEWORK, AssignmentType.EXAM] as const).map(t => (
              <button
                key={t}
                onClick={() => { setType(t); if (t === AssignmentType.EXAM) setShowQuestions(true) }}
                className={cn(
                  "flex-1 rounded-2xl border py-3 text-sm font-medium transition-all",
                  type === t ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted"
                )}
              >
                {t === AssignmentType.HOMEWORK ? "📚 واجب" : "📝 امتحان"}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">العنوان *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isExam ? "مثال: امتحان الفصل الأول" : "مثال: واجب الدرس الخامس"}
              autoFocus
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف / التعليمات (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isExam ? "تعليمات الامتحان..." : "تعليمات الواجب..."}
              rows={2}
              className="flex w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Exam-specific: duration */}
          {isExam && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                <Clock className="inline size-3.5 me-1 text-amber-500" />
                مدة الامتحان (بالدقائق)
              </label>
              <input
                type="number"
                min={1}
                max={600}
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="مثال: 60"
                className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
              />
            </div>
          )}

          {/* YouTube */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">رابط يوتيوب (اختياري)</label>
            <input
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">تاريخ التسليم (اختياري)</label>
            <input
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              type="datetime-local"
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Questions section — exam only */}
          {isExam && (
            <div className="space-y-3">
              <button
                onClick={() => setShowQuestions(p => !p)}
                className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                <span className="flex items-center gap-2">
                  📋 الأسئلة ({questions.length} سؤال)
                  {questions.length > 0 && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      {questions.reduce((s, q) => s + q.points, 0)} نقطة
                    </span>
                  )}
                </span>
                {showQuestions ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>

              {showQuestions && (
                <QuestionBuilder questions={questions} onChange={setQuestions} />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border/60 px-5 py-4 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={createMut.isPending}
          >
            <Plus className="size-4" />{createMut.isPending ? "جارٍ الإضافة..." : "إضافة"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Submissions Modal ────────────────────────────────────────────────────────
function SubmissionsModal({
  assignmentId,
  title,
  onClose,
}: {
  assignmentId: string
  title:        string
  onClose:      () => void
}) {
  const [selected, setSelected] = useState<string | null>(null)

  const { data: raw, isLoading } = useQuery({
    queryKey: ["exam-submissions", assignmentId],
    queryFn:  () =>
      clientFetch<{ data: ApiExamSubmission[] }>(
        `/api/assignments/${assignmentId}/submissions?limit=100`
      ),
    enabled: !!assignmentId,
  })

  const submissions: ApiExamSubmission[] = (() => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as ApiExamSubmission[]
    if (typeof raw === "object" && "data" in raw) return (raw as { data: ApiExamSubmission[] }).data ?? []
    return []
  })()

  const selectedSub = selected ? submissions.find(s =>
    (resolveId(s as { _id?: string; id?: string })) === selected
  ) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 sm:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <div>
            <h2 className="text-base font-bold">إجابات الطلاب</h2>
            <p className="text-xs text-muted-foreground">{title}</p>
          </div>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: student list */}
          <div className="w-56 shrink-0 border-e border-border/40 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                <Users className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">لا توجد إجابات بعد</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {submissions.map(sub => {
                  const sid  = resolveId(sub as { _id?: string; id?: string })
                  const pct  = sub.total ? Math.round((sub.score / sub.total) * 100) : 0
                  const st   = sub.student as { name?: string } | undefined
                  return (
                    <button
                      key={sid}
                      onClick={() => setSelected(prev => prev === sid ? null : sid)}
                      className={cn(
                        "w-full rounded-xl px-3 py-2.5 text-start transition-all",
                        selected === sid
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <p className="text-xs font-semibold truncate">{st?.name ?? "طالب"}</p>
                      <p className={cn("text-[10px] mt-0.5", selected === sid ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {sub.score}/{sub.total} ({pct}٪)
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: submission detail */}
          <div className="flex-1 overflow-y-auto p-4">
            {!selectedSub ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <p className="text-3xl mb-2">👆</p>
                <p className="text-sm">اختر طالباً من القائمة لعرض إجاباته</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score summary */}
                <div className={cn(
                  "rounded-2xl border p-4",
                  selectedSub.total && (selectedSub.score / selectedSub.total) >= 0.5
                    ? "border-emerald-200/60 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20"
                    : "border-rose-200/60 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-950/20"
                )}>
                  <p className="text-lg font-extrabold">
                    {selectedSub.score} / {selectedSub.total}{" "}
                    <span className="text-sm font-medium text-muted-foreground">
                      ({selectedSub.total ? Math.round((selectedSub.score / selectedSub.total) * 100) : 0}٪)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    تاريخ التسليم: {new Date(selectedSub.submittedAt).toLocaleDateString("ar-EG", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* Answers */}
                {(selectedSub.answersWithDetails ?? selectedSub.answers ?? []).map((ans, i) => (
                  <div key={ans.questionId} className="rounded-xl border border-border/50 bg-card p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-muted text-[10px] font-bold">{i + 1}</span>
                      <p className="flex-1 text-xs font-medium">{ans.questionText ?? `سؤال ${i + 1}`}</p>
                      {ans.isCorrect === true  && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                      {ans.isCorrect === false && <XCircle      className="size-4 text-rose-500 shrink-0" />}
                    </div>
                    <div className="flex gap-2 ps-8 text-[11px]">
                      <span className={cn(
                        "rounded-lg border px-2 py-1",
                        ans.isCorrect
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-400"
                      )}>
                        إجابة الطالب: <strong>{ans.chosen}</strong>
                      </span>
                      {!ans.isCorrect && ans.correctAnswer && (
                        <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                          الصحيحة: <strong>{ans.correctAnswer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TeacherAssignmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: groupId } = use(params)
  const qc = useQueryClient()
  const [showCreate, setShowCreate]   = useState(false)
  const [deleteId,   setDeleteId]     = useState<string | null>(null)
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [viewSubs,   setViewSubs]     = useState<{ id: string; title: string } | null>(null)

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["assignments", groupId],
    queryFn:  () => clientFetch<PaginatedResponse<ApiAssignment>>(`/api/assignments/group/${groupId}?limit=50`),
    enabled:  !!groupId,
  })
  const assignments = toArray<ApiAssignment>(rawData)

  const deleteMut = useMutation({
    mutationFn: (id: string) => clientFetch(`/api/assignments/${id}`, { method: "DELETE" } as never),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ["assignments", groupId] }); setDeleteId(null) },
  })

  return (
    <>
      {showCreate && <CreateAssignmentModal groupId={groupId} onClose={() => setShowCreate(false)} />}

      {viewSubs && (
        <SubmissionsModal
          assignmentId={viewSubs.id}
          title={viewSubs.title}
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
          userName="" userAvatar="م" userAvatarColor="bg-violet-500" profileHref="/teacher/profile" />

        <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{isLoading ? "جارٍ التحميل..." : `${assignments.length} عنصر`}</p>
            <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90">
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
              <Button className="mt-4 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={() => setShowCreate(true)}>
                <Plus className="size-4" />إضافة أول واجب
              </Button>
            </div>
          ) : (
            assignments.map(a => {
              const aid    = resolveId(a as { _id?: string; id?: string })
              const isExam = a.type === AssignmentType.EXAM
              const isOpen = expandedId === aid
              const totalPoints = (a.questions ?? []).reduce((s, q) => s + (q.points ?? 1), 0)

              return (
                <div key={aid} className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden",
                  isExam ? "border-rose-200/60 dark:border-rose-800/30" : "border-border/60")}>
                  <div className="p-4">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={cn("grid size-9 place-items-center rounded-xl shrink-0 text-base",
                          isExam ? "bg-rose-100 dark:bg-rose-900/30" : "bg-violet-100 dark:bg-violet-900/30")}>
                          {isExam ? "📝" : "📚"}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className={cn("text-[10px] rounded-full px-2 py-0.5 font-bold shrink-0",
                              isExam ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                     : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400")}>
                              {ASSIGNMENT_TYPE_LABELS[a.type]}
                            </span>
                            {a.durationMinutes && (
                              <span className="flex items-center gap-1 text-[10px] rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-bold dark:bg-amber-900/30 dark:text-amber-400">
                                <Clock className="size-2.5" />{a.durationMinutes} دقيقة
                              </span>
                            )}
                            {(a.questions ?? []).length > 0 && (
                              <span className="text-[10px] rounded-full px-2 py-0.5 bg-violet-100 text-violet-700 font-bold dark:bg-violet-900/30 dark:text-violet-400">
                                {a.questions.length} سؤال · {totalPoints} نقطة
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-sm truncate">{a.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {(a.questions ?? []).length > 0 && (
                          <button onClick={() => setExpandedId(isOpen ? null : aid)}
                            className="grid size-8 place-items-center rounded-xl border border-border/60 text-muted-foreground hover:bg-muted transition-colors">
                            {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                          </button>
                        )}
                        {/* View submissions — exams only */}
                        {isExam && (
                          <button
                            onClick={() => setViewSubs({ id: aid, title: a.title })}
                            className="grid size-8 place-items-center rounded-xl border border-teal-200 text-teal-600 hover:bg-teal-50 transition-colors dark:border-teal-800 dark:hover:bg-teal-950/20"
                            title="عرض إجابات الطلاب"
                          >
                            <Users className="size-3.5" />
                          </button>
                        )}
                        <button onClick={() => setDeleteId(aid)}
                          className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20">
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
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

                  {/* Questions preview (teacher sees correct answers) */}
                  {isOpen && (a.questions ?? []).length > 0 && (
                    <div className="border-t border-border/40 bg-muted/20 p-4 space-y-3">
                      <p className="text-xs font-bold text-muted-foreground mb-2">الأسئلة:</p>
                      {a.questions.map((q, qi) => (
                        <div key={q._id ?? qi} className="rounded-xl border border-border/60 bg-card p-3 space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="grid size-5 shrink-0 place-items-center rounded-lg bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 mt-0.5">
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
