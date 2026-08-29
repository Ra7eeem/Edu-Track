"use client"

import { useGroupRanking } from "@/features/teacher/hooks/use-group-ranking"
import { resetRankingAction, addBonusAction } from "@/features/teacher/actions/ranking.action"
import { ApiRankingEntry, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { useQueryClient } from "@tanstack/react-query"
import { useState, useTransition, useRef } from "react"
import { Gift, RefreshCcw, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

const ARABIC_MONTHS = [
  "", "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]
const medals = ["🥇","🥈","🥉"]

// ─── Bonus Modal ──────────────────────────────────────────────────────────────
function BonusModal({
  groupId, studentId, studentName, month, year, onClose,
}: {
  groupId: string; studentId: string; studentName: string
  month: number; year: number; onClose: () => void
}) {
  const qc         = useQueryClient()
  const overlayRef = useRef<HTMLDivElement>(null)
  const [bonus,    setBonus]    = useState("")
  const [error,    setError]    = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = () => {
    const val = Number(bonus)
    if (!val || val <= 0) { setError("أدخل رقماً موجباً"); return }
    setError(null)
    startTransition(async () => {
      const res = await addBonusAction(groupId, studentId, val, month, year)
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["groups", groupId, "ranking"] })
        onClose()
      } else {
        setError(res.error ?? "حدث خطأ")
      }
    })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Gift className="size-4 text-amber-500" /> نقاط مكافأة لـ {studentName}
          </h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {error && (
            <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {ARABIC_MONTHS[month]} {year} — ستُضاف النقاط إلى رصيد الطالب فوراً
          </p>
          <input
            type="number"
            min="1"
            value={bonus}
            onChange={e => setBonus(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="عدد النقاط (مثل: 5)"
            autoFocus
            className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={isPending}
          >
            <Gift className="size-4" />{isPending ? "جارٍ الإضافة..." : "إضافة النقاط"}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  groupId:        string
  initialRanking: ApiRankingEntry[]
  currentMonth:   number
  currentYear:    number
  isTeacher?:     boolean   // controls bonus+reset visibility
}

export function RankingClient({ groupId, initialRanking, currentMonth, currentYear, isTeacher = false }: Props) {
  const qc = useQueryClient()
  const { data } = useGroupRanking(groupId, currentMonth, currentYear)
  const ranking  = data?.ranking ?? initialRanking

  const [bonusTarget, setBonusTarget]   = useState<{ id: string; name: string } | null>(null)
  const [showReset,   setShowReset]     = useState(false)
  const [resetErr,    setResetErr]      = useState<string | null>(null)
  const [isPending,   startTransition]  = useTransition()

  const handleReset = () => {
    setResetErr(null)
    startTransition(async () => {
      const res = await resetRankingAction(groupId, currentMonth, currentYear)
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["groups", groupId, "ranking"] })
        setShowReset(false)
      } else {
        setResetErr(res.error ?? "حدث خطأ")
      }
    })
  }

  const top3 = ranking.slice(0, 3)

  return (
    <>
      {bonusTarget && (
        <BonusModal
          groupId={groupId}
          studentId={bonusTarget.id}
          studentName={bonusTarget.name}
          month={currentMonth}
          year={currentYear}
          onClose={() => setBonusTarget(null)}
        />
      )}

      {/* Reset confirmation */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
            <p className="text-4xl">🔄</p>
            <p className="font-bold">تصفير الترتيب؟</p>
            <p className="text-sm text-muted-foreground">
              سيتم تصفير جميع نقاط طلاب هذه المجموعة لشهر {ARABIC_MONTHS[currentMonth]} {currentYear}
            </p>
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

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        {/* Header + reset button */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-extrabold">ترتيب {ARABIC_MONTHS[currentMonth]} {currentYear}</p>
            <p className="text-xs text-muted-foreground">{ranking.length} طالب</p>
          </div>
          {isTeacher && (
            <Button
              size="sm"
              variant="outline"
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
              onClick={() => setShowReset(true)}
            >
              <RefreshCcw className="size-3.5" />تصفير الترتيب
            </Button>
          )}
        </div>

        {ranking.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-medium">لا يوجد ترتيب بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">سيظهر الترتيب بعد تسجيل الحضور</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 2 && (
              <div className="mb-6 grid grid-cols-3 items-end gap-2 rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-amber-50/10 p-4 dark:border-amber-800/30 dark:from-amber-950/20 dark:to-transparent">
                {[top3[1], top3[0], top3[2]].map((entry, i) => {
                  if (!entry) return <div key={i} />
                  const pos = i===0?2:i===1?1:3
                  const heights = ["h-20","h-28","h-16"]
                  const podColor = pos===1
                    ? "bg-gradient-to-t from-amber-400 to-amber-300"
                    : pos===2
                    ? "bg-gradient-to-t from-slate-300 to-slate-200 dark:from-slate-600"
                    : "bg-gradient-to-t from-amber-700/60 to-amber-600/50"
                  const sid = resolveId(entry.student)
                  return (
                    <div key={sid} className={cn("flex flex-col items-center gap-1", i===1 && "-mt-3")}>
                      <span className="text-xl">{medals[pos-1]}</span>
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
              {ranking.map((entry: ApiRankingEntry) => {
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
                        ? medals[entry.rank-1]
                        : <span className="text-xs font-bold text-muted-foreground">#{entry.rank}</span>
                      }
                    </span>
                    <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                      {entry.student.name[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{entry.student.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="text-emerald-600">{entry.presentCount} حضور</span>
                        {entry.lateCount > 0 && <span className="text-amber-600">{entry.lateCount} متأخر</span>}
                        {entry.absentCount > 0 && <span className="text-rose-600">{entry.absentCount} غياب</span>}
                        {entry.bonusPoints > 0 && <span className="text-violet-600">+{entry.bonusPoints} مكافأة</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isTeacher && (
                        <button
                          onClick={() => setBonusTarget({ id: sid, name: entry.student.name })}
                          className="grid size-7 place-items-center rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors dark:border-amber-800 dark:hover:bg-amber-950/20"
                          title="إضافة نقاط مكافأة"
                        >
                          <Gift className="size-3.5" />
                        </button>
                      )}
                      <div className="text-end">
                        <p className="text-sm font-bold text-primary">{entry.score}</p>
                      </div>
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
