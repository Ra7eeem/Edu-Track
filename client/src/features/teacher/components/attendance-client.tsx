"use client"

import { Button } from "@/shared/components/ui/button"
import { saveAttendanceAction } from "@/features/teacher/actions/attendance.action"
import { AttendanceStatus } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { CheckCircle2, RotateCcw, Save, Search, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

interface Student { id: string; name: string; avatar: string }

interface Props {
  groupId:  string
  students: Student[]
}

type Status = AttendanceStatus | "none"

export function AttendanceClient({ groupId, students }: Props) {
  const router = useRouter()
  const [attendance, setAttendance] = useState<Record<string, Status>>(
    Object.fromEntries(students.map((s) => [s.id, "none"]))
  )
  const [search,     setSearch]     = useState("")
  const [saved,      setSaved]      = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()

  const filtered = useMemo(
    () => students.filter((s) => s.name.includes(search)),
    [students, search]
  )

  const present = Object.values(attendance).filter((v) => v === AttendanceStatus.PRESENT).length
  const absent  = Object.values(attendance).filter((v) => v === AttendanceStatus.ABSENT).length
  const pending = students.length - present - absent

  const mark = (id: string, status: AttendanceStatus) =>
    setAttendance((prev) => ({ ...prev, [id]: prev[id] === status ? "none" : status }))

  const markAll = (status: AttendanceStatus) =>
    setAttendance(Object.fromEntries(students.map((s) => [s.id, status])))

  const reset = () => {
    setAttendance(Object.fromEntries(students.map((s) => [s.id, "none"])))
    setSaved(false)
    setError(null)
  }

  const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD

  const handleSave = () => {
    if (pending > 0) return
    const records = students.map((s) => ({
      studentId: s.id,
      status:    attendance[s.id] === "none" ? AttendanceStatus.ABSENT : attendance[s.id] as AttendanceStatus,
    }))
    startTransition(async () => {
      const result = await saveAttendanceAction(groupId, today, records)
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error ?? "حدث خطأ")
      }
    })
  }

  return (
    <div className="flex flex-col">
      {/* Sticky stats bar */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-card px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold">{students.length} طالب</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="size-4" />{present} حاضر
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <XCircle className="size-4" />{absent} غائب
              </span>
              {pending > 0 && <span className="text-muted-foreground text-xs">{pending} لم يُسجَّل</span>}
            </div>
            <Button size="sm" variant="ghost" onClick={reset} className="text-muted-foreground">
              <RotateCcw className="size-3.5" />إعادة
            </Button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ width: students.length ? `${(present / students.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-muted-foreground">{new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن طالب..."
            className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Quick actions */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => markAll(AttendanceStatus.PRESENT)}
            className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            ✓ تحضير الكل
          </button>
          <button
            onClick={() => markAll(AttendanceStatus.ABSENT)}
            className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400"
          >
            ✗ غياب الكل
          </button>
        </div>

        {/* Students list */}
        <div className="space-y-2">
          {filtered.map((s) => {
            const status = attendance[s.id]
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                  status === AttendanceStatus.PRESENT ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20"
                  : status === AttendanceStatus.ABSENT ? "border-rose-200 bg-rose-50/60 dark:border-rose-800/50 dark:bg-rose-950/20"
                  : "border-border/60 bg-card"
                )}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                  {s.avatar}
                </span>
                <span className="flex-1 text-sm font-medium">{s.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => mark(s.id, AttendanceStatus.PRESENT)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                      status === AttendanceStatus.PRESENT
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    )}
                  >
                    حاضر
                  </button>
                  <button
                    onClick={() => mark(s.id, AttendanceStatus.ABSENT)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                      status === AttendanceStatus.ABSENT
                        ? "bg-rose-500 text-white shadow-sm"
                        : "border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                    )}
                  >
                    غائب
                  </button>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">لا يوجد طلاب مطابقون</div>
          )}
        </div>

        {/* Save */}
        <div className="sticky bottom-20 mt-6 md:bottom-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg">
              <CheckCircle2 className="size-5" /> تم حفظ الحضور بنجاح!
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50"
              disabled={isPending}
              onClick={handleSave}
            >
              <Save className="size-4" />
              {isPending ? "جارٍ الحفظ..." : pending > 0 ? `سجّل باقي ${pending} طالب أولاً` : "حفظ الحضور"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
