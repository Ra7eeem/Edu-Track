"use client"

import { useState } from "react"
import { useTodayQuestion, useAnswerDailyQuestion } from "../hooks/use-daily-question"
import { triggerCelebration } from "@/shared/lib/confetti"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  X,
  Award,
  Lightbulb,
} from "lucide-react"

interface Props {
  classroomId: string
  isOpen: boolean
  onClose: () => void
}

const OPTION_LABELS = ["أ", "ب", "ج", "د"]

export function DailyQuestionModal({ classroomId, isOpen, onClose }: Props) {
  const { data: question, isLoading } = useTodayQuestion(classroomId)
  const answerMut = useAnswerDailyQuestion(classroomId)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [submittedResult, setSubmittedResult] = useState<{
    isCorrect: boolean
    correctOptionIndex: number
    explanation?: string
    pointsEarned: number
  } | null>(null)
  const [submitErr, setSubmitErr] = useState<string | null>(null)

  if (!isOpen) return null

  const isAnswered = question?.alreadyAnswered || !!submittedResult
  const currentResult = submittedResult || (question?.previousAnswer ? {
    isCorrect: question.previousAnswer.isCorrect,
    correctOptionIndex: question.correctOptionIndex ?? 0,
    explanation: question.explanation,
    pointsEarned: question.previousAnswer.pointsEarned,
  } : null)

  const activeSelectedIndex =
    selectedIndex !== null
      ? selectedIndex
      : question?.previousAnswer?.selectedOptionIndex ?? null

  const handleSubmit = async () => {
    if (selectedIndex === null || !question) return
    setSubmitErr(null)

    try {
      const res = await answerMut.mutateAsync({
        questionId: question._id,
        selectedOptionIndex: selectedIndex,
      })

      setSubmittedResult(res)

      if (res.isCorrect) {
        triggerCelebration()
      }
    } catch (err: any) {
      setSubmitErr(err.message || "حدث خطأ أثناء إرسال الإجابة")
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-amber-500/15 text-amber-600">
              <Sparkles className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-heading">سؤال اليوم التنافسي 💡</h2>
              <p className="text-[11px] text-muted-foreground">
                أجب صح واربح نقاطاً إضافية تضاف لرصيدك ولفريقك!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isLoading ? (
            <div className="space-y-3 py-6 animate-pulse">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
              <div className="h-10 bg-muted rounded-xl" />
            </div>
          ) : !question ? (
            <div className="py-12 text-center text-muted-foreground">
              <HelpCircle className="mx-auto size-12 text-muted-foreground/30 mb-2" />
              <p className="font-semibold text-foreground">لم يتم نشر سؤال لهذا اليوم بعد</p>
              <p className="text-xs mt-1">ترقب سؤال اليوم من المعلم قريباً!</p>
            </div>
          ) : (
            <>
              {/* Question card */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">تحدي اليوم</span>
                  <span className="rounded-full bg-accent/20 px-2.5 py-0.5 font-bold text-heading">
                    +{question.rewardPoints} نقاط
                  </span>
                </div>
                <p className="font-display text-base font-bold text-foreground leading-relaxed">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {question.options.map((opt, idx) => {
                  const isSelected = activeSelectedIndex === idx
                  const isCorrect = currentResult && currentResult.correctOptionIndex === idx
                  const isWrongSelected =
                    currentResult && !currentResult.isCorrect && isSelected

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered || answerMut.isPending}
                      onClick={() => setSelectedIndex(idx)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-start text-sm transition-all",
                        isCorrect
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/30"
                          : isWrongSelected
                          ? "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold"
                          : isSelected
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                          : "border-border/70 bg-card hover:border-primary/40 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid size-6 place-items-center rounded-lg text-xs font-bold",
                            isCorrect
                              ? "bg-emerald-500 text-white"
                              : isWrongSelected
                              ? "bg-rose-500 text-white"
                              : isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {OPTION_LABELS[idx]}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isCorrect && <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />}
                      {isWrongSelected && <XCircle className="size-4 text-rose-500 shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {submitErr && (
                <p className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive text-center">
                  {submitErr}
                </p>
              )}

              {/* Answer Result & Explanation */}
              {currentResult && (
                <div
                  className={cn(
                    "rounded-2xl border p-4 space-y-2 animate-in fade-in",
                    currentResult.isCorrect
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-300"
                  )}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {currentResult.isCorrect ? (
                      <>
                        <CheckCircle2 className="size-5 text-emerald-500" />
                        <span>إجابة صحيحة! أحسنت 🎉 حصلت على +{currentResult.pointsEarned} نقاط</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="size-5 text-rose-500" />
                        <span>إجابة غير صحيحة، حظاً أوفر في تحدي الغد!</span>
                      </>
                    )}
                  </div>

                  {currentResult.explanation && (
                    <div className="pt-2 border-t border-border/30 text-xs leading-relaxed">
                      <p className="font-semibold flex items-center gap-1 mb-0.5">
                        <Lightbulb className="size-3.5 text-amber-500" />
                        توضيح المعلم:
                      </p>
                      <p className="text-muted-foreground">{currentResult.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={onClose}
                >
                  إغلاق
                </Button>

                {!isAnswered && (
                  <Button
                    type="button"
                    disabled={selectedIndex === null || answerMut.isPending}
                    onClick={handleSubmit}
                    className="flex-1 rounded-xl bg-primary text-primary-foreground font-semibold"
                  >
                    {answerMut.isPending ? "جارٍ التحقق..." : "تأكيد الإجابة"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
