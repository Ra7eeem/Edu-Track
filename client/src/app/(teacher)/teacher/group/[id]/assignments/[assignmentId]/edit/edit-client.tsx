"use client"

import { Button } from "@/shared/components/ui/button"
import { TopBar } from "@/shared/components/layout/topbar"
import { updateAssignmentAction } from "@/features/teacher/actions/assignment.action"
import { clientFetch } from "@/shared/lib/api-client"
import {
  ApiAssignment, ApiChoice, ApiExamSubmission, ApiQuestion,
  AssignmentType, ASSIGNMENT_TYPE_LABELS,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown, ChevronUp, Clock, Plus, Trash2, X, ArrowLeft,
  AlertTriangle, CheckCircle2, Save, Users,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const CHOICE_IDS = ["أ", "ب", "ج", "د"]

function defaultChoices(): ApiChoice[] {
  return CHOICE_IDS.slice(0, 4).map(id => ({ id, text: "" }))
}

function emptyQuestion(idx: number): ApiQuestion & { _localId: number } {
  return { _localId: idx, text: "", choices: defaultChoices(), correctAnswer: "أ", points: 1 }
}

function toDatetimeLocal(isoString?: string | null): string {
  if (!isoString) return ""
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`
}

function stripLocalId(q: ApiQuestion & { _localId?: number }): ApiQuestion {
  const { _localId, ...rest } = q
  void _localId
  return rest
}

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
      const correctAnswer = choices.some(c => c.id === q.correctAnswer)
        ? q.correctAnswer : choices[0]?.id ?? "أ"
      return { ...q, choices, correctAnswer }
    }))

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div
          key={q._localId ?? q._id ?? qi}
          className="rounded-2xl border border-violet-200/60 bg-violet-50/30 dark:border-violet-800/30 dark:bg-violet-950/10 p-4 space-y-3"
        >
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
                type="button"
                onClick={() => removeQ(qi)}
                className="grid size-7 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800"
                title="حذف هذا السؤال"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={q.text}
            onChange={e => updateQ(qi, { text: e.target.value })}
            placeholder={`اكتب السؤال ${qi + 1} هنا...`}
            rows={2}
            className="flex w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />

          <div className="space-y-2">
            {q.choices.map((c, ci) => (
              <div key={c.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQ(qi, { correctAnswer: c.id })}
                  className={cn(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all",
                    q.correctAnswer === c.id
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                      : "border-border hover:border-emerald-400"
                  )}
                  title="اضغط لتعيين كإجابة صحيحة"
                >
                  {q.correctAnswer === c.id && (
                    <span className="text-[10px] font-bold">✓</span>
                  )}
                </button>

                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-card border border-border text-xs font-bold">
                  {c.id}
                </span>

                <input
                  value={c.text}
                  onChange={e => updateChoice(qi, ci, e.target.value)}
                  placeholder={`الخيار ${c.id}`}
                  className="flex-1 h-9 rounded-xl border border-input bg-card px-3 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
                />

                {q.choices.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeChoice(qi, ci)}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    title="حذف هذا الخيار"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            {q.choices.length < 6 ? (
              <button
                type="button"
                onClick={() => addChoice(qi)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
              >
                <Plus className="size-3.5" />إضافة خيار
              </button>
            ) : <span />}

            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              ✓ الإجابة الصحيحة المحددة: الخيار ({q.correctAnswer})
            </p>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQ}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 py-3.5 text-sm font-medium text-violet-700 hover:bg-violet-100/50 transition-colors dark:border-violet-700 dark:bg-violet-950/20 dark:text-violet-400"
      >
        <Plus className="size-4" />إضافة سؤال جديد
      </button>
    </div>
  )
}

interface EditAssignmentClientProps {
  groupId:           string
  assignmentId:      string
  initialAssignment: ApiAssignment
  userName:          string
}

export default function EditAssignmentClient({
  groupId,
  assignmentId,
  initialAssignment,
  userName,
}: EditAssignmentClientProps) {
  const router = useRouter()
  const qc = useQueryClient()

  const [type,            setType]            = useState<AssignmentType>(initialAssignment.type ?? AssignmentType.HOMEWORK)
  const [title,           setTitle]           = useState(initialAssignment.title ?? "")
  const [description,     setDescription]     = useState(initialAssignment.description ?? "")
  const [youtubeUrl,      setYoutubeUrl]      = useState(initialAssignment.youtubeUrl ?? "")
  const [dueDate,         setDueDate]         = useState(toDatetimeLocal(initialAssignment.dueDate))
  const [durationMinutes, setDurationMinutes] = useState(
    initialAssignment.durationMinutes ? String(initialAssignment.durationMinutes) : ""
  )
  const [availableFrom,   setAvailableFrom]   = useState(toDatetimeLocal(initialAssignment.availableFrom))
  const [availableTo,     setAvailableTo]     = useState(toDatetimeLocal(initialAssignment.availableTo))
  const [questions,       setQuestions]       = useState<(ApiQuestion & { _localId?: number })[]>(() => {
    return (initialAssignment.questions ?? []).map((q, idx) => ({
      ...q,
      _localId: idx,
    }))
  })
  const [showQuestions,   setShowQuestions]   = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [successMsg,      setSuccessMsg]      = useState<string | null>(null)

  const isExam = type === AssignmentType.EXAM

  // Check submissions count for notification
  const { data: subsData } = useQuery({
    queryKey: ["exam-submissions-count", assignmentId],
    queryFn: () =>
      clientFetch<{ data: ApiExamSubmission[] }>(
        `/api/assignments/${assignmentId}/submissions?limit=100`
      ),
    enabled: isExam,
  })

  const submissionsCount = (() => {
    if (!subsData) return 0
    if (Array.isArray(subsData)) return subsData.length
    if (typeof subsData === "object" && "data" in subsData) {
      return (subsData as { data: ApiExamSubmission[] }).data?.length ?? 0
    }
    return 0
  })()

  const updateMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => updateAssignmentAction(assignmentId, body),
    onSuccess: (res) => {
      if ("error" in res) {
        setError(res.error)
        return
      }
      setSuccessMsg("تم حفظ التعديلات وإعادة تصحيح درجات الطلاب بنجاح!")
      qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] })
      qc.invalidateQueries({ queryKey: ["exam-submissions", assignmentId] })
      qc.invalidateQueries({ queryKey: ["assignment", assignmentId] })
      setTimeout(() => {
        router.push(`/teacher/group/${groupId}/assignments`)
      }, 1000)
    },
    onError: (err: Error) => {
      setError(err.message || "حدث خطأ أثناء حفظ التعديلات")
    },
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
    setSuccessMsg(null)

    await updateMut.mutateAsync({
      groupId,
      type,
      title:           title.trim(),
      description:     description.trim() || undefined,
      youtubeUrl:      youtubeUrl.trim(),
      dueDate:         dueDate            || undefined,
      durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
      availableFrom:   availableFrom   || undefined,
      availableTo:     availableTo     || undefined,
      questions:       isExam ? questions.map(stripLocalId) : [],
    })
  }

  const handleBack = () => {
    router.push(`/teacher/group/${groupId}/assignments`)
  }

  const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0)

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        title={isExam ? "تعديل الامتحان والأسئلة" : "تعديل الواجب"}
        notifHref="/teacher/notifications"
        userName={userName}
        userAvatar={userName ? userName[0] : "م"}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-6 flex-1">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="size-4" />
          رجوع إلى قائمة الواجبات
        </button>

        {/* Notice if exam has student submissions */}
        {isExam && submissionsCount > 0 && (
          <div className="rounded-2xl border border-amber-300/80 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/20 p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <Users className="size-4 shrink-0" />
              <span>يوجد {submissionsCount} تسليم لهذا الامتحان بالفعل</span>
            </div>
            <p className="text-xs text-amber-700/90 dark:text-amber-400 leading-relaxed">
              أي تعديل على الأسئلة أو تغيير الإجابة الصحيحة أو النقاط سيقوم تلقائياً بإعادة تصحيح إجابات جميع الطلاب وتحديث درجاتهم فور حفظ التعديل.
            </p>
          </div>
        )}

        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">نوع العنصر</label>
            <div className="grid grid-cols-2 gap-2">
              {([AssignmentType.HOMEWORK, AssignmentType.EXAM] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-2xl border py-2.5 text-xs font-bold transition-all",
                    type === t
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/60 hover:bg-muted"
                  )}
                >
                  <span>{t === AssignmentType.EXAM ? "📝" : "📚"}</span>
                  <span>{ASSIGNMENT_TYPE_LABELS[t]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">العنوان *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: امتحان الشهر الأول / واجب الدرس الأول"
              className="flex h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">الوصف / تعليمات (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب تعليمات للطلاب أو تفاصيل إضافية..."
              rows={3}
              className="flex w-full rounded-2xl border border-input bg-card px-4 py-2.5 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* YouTube Video URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">رابط شرح فيديو يوتيوب (اختياري)</label>
            <input
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              dir="ltr"
              className="flex h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Exam duration */}
          {isExam && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">مدة الامتحان (بالدقائق)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  placeholder="مثال: 30"
                  className="flex h-11 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
                />
                <Clock className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">تاريخ الاستحقاق / النهاية</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="flex h-11 w-full rounded-2xl border border-input bg-card px-3 text-xs outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
              />
            </div>
            {isExam && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">متاح للطلاب من</label>
                  <input
                    type="datetime-local"
                    value={availableFrom}
                    onChange={e => setAvailableFrom(e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-input bg-card px-3 text-xs outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground">متاح للطلاب حتى</label>
                  <input
                    type="datetime-local"
                    value={availableTo}
                    onChange={e => setAvailableTo(e.target.value)}
                    className="flex h-11 w-full rounded-2xl border border-input bg-card px-3 text-xs outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
                  />
                </div>
              </>
            )}
          </div>

          {/* Questions Section */}
          {isExam && (
            <div className="space-y-3 pt-2 border-t border-border/40">
              <button
                type="button"
                onClick={() => setShowQuestions(prev => !prev)}
                className="flex w-full items-center justify-between py-1 text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>أسئلة الامتحان ({questions.length} سؤال)</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    · المجموع: {totalPoints} درجة
                  </span>
                </div>
                {showQuestions ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              </button>

              {showQuestions && (
                <QuestionBuilder
                  questions={questions}
                  onChange={setQuestions}
                />
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-2xl h-11"
              onClick={handleBack}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              className="flex-1 rounded-2xl h-11 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90 shadow-md font-bold"
              onClick={handleSubmit}
              disabled={updateMut.isPending}
            >
              <Save className="size-4" />
              {updateMut.isPending ? "جارٍ حفظ وتحديث الدرجات..." : "حفظ التعديلات وتحديث الدرجات"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
