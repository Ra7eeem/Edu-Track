"use client"

import { Button } from "@/shared/components/ui/button"
import { TopBar } from "@/shared/components/layout/topbar"
import { createAssignmentAction } from "@/features/teacher/actions/assignment.action"
import {
  ApiChoice, ApiQuestion, AssignmentType,
} from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, ChevronUp, Clock, Plus, Trash2, X, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

const CHOICE_IDS = ["أ", "ب", "ج", "د"]
function defaultChoices(): ApiChoice[] {
  return CHOICE_IDS.slice(0, 4).map(id => ({ id, text: "" }))
}
function emptyQuestion(idx: number): ApiQuestion & { _localId: number } {
  return { _localId: idx, text: "", choices: defaultChoices(), correctAnswer: "أ", points: 1 }
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
          key={q._localId ?? qi}
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
                onClick={() => removeQ(qi)}
                className="grid size-7 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800"
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
                      ? "border-emerald-500 bg-emerald-500 text-white"
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
                    onClick={() => removeChoice(qi, ci)}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {q.choices.length < 6 && (
            <button
              onClick={() => addChoice(qi)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Plus className="size-3.5" />إضافة خيار
            </button>
          )}

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

interface NewAssignmentClientProps {
  groupId:  string
  userName: string
}

export default function NewAssignmentClient({ groupId, userName }: NewAssignmentClientProps) {
  const router = useRouter()
  const qc = useQueryClient()

  const [type,            setType]            = useState<AssignmentType>(AssignmentType.HOMEWORK)
  const [title,           setTitle]           = useState("")
  const [description,     setDescription]     = useState("")
  const [youtubeUrl,      setYoutubeUrl]      = useState("")
  const [dueDate,         setDueDate]         = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [availableFrom,   setAvailableFrom]   = useState("")
  const [availableTo,     setAvailableTo]     = useState("")
  const [questions,       setQuestions]       = useState<(ApiQuestion & { _localId?: number })[]>([])
  const [showQuestions,   setShowQuestions]   = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  const isExam = type === AssignmentType.EXAM

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => createAssignmentAction(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teacher", "assignments", groupId] })
      router.push(`/teacher/group/${groupId}/assignments`)
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
    try {
      await createMut.mutateAsync({
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
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "حدث خطأ")
    }
  }

  const handleBack = () => {
    router.push(`/teacher/group/${groupId}/assignments`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title="إضافة واجب / امتحان" notifHref="/teacher/notifications"
        userName={userName} userAvatar={userName ? userName[0] : "م"} userAvatarColor="bg-violet-500" profileHref="/teacher/profile" />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-6 flex-1">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="size-4" />
          رجوع إلى قائمة الواجبات
        </button>

        <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-5 space-y-5">
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}

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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">العنوان *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={isExam ? "مثال: امتحان الفصل الأول" : "مثال: واجب الدرس الخامس"}
              autoFocus
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف / التعليمات (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={isExam ? "تعليمات الامتحان..." : "تعليمات الواجب..."}
              rows={2}
              className="flex w-full rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

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
                className="flex h-10 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
              />
            </div>
          )}

          {isExam && (
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/40 p-4 space-y-3 dark:border-amber-800/30 dark:bg-amber-950/10">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Clock className="size-3.5" />
                نافذة توفّر الامتحان (اختياري)
              </p>
              <p className="text-[10px] text-muted-foreground">حدد الفترة الزمنية التي يستطيع الطلاب فيها بدء الامتحان.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">من</label>
                  <input
                    type="datetime-local"
                    value={availableFrom}
                    onChange={e => setAvailableFrom(e.target.value)}
                    className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground">إلى</label>
                  <input
                    type="datetime-local"
                    value={availableTo}
                    onChange={e => setAvailableTo(e.target.value)}
                    className="flex h-9 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">رابط يوتيوب (اختياري)</label>
            <input
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">تاريخ التسليم (اختياري)</label>
            <input
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              type="datetime-local"
              className="flex h-10 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>

          {isExam && (
            <div className="space-y-3">
              <button
                onClick={() => setShowQuestions(p => !p)}
                className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
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

        <div className="flex gap-2 pb-6">
          <Button variant="outline" className="flex-1" onClick={handleBack}>إلغاء</Button>
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
