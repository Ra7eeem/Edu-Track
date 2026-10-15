"use client"

import { Button }     from "@/shared/components/ui/button"
import { useOfflineAttendance } from "@/features/teacher/hooks/use-offline-attendance"
import { AttendanceStatus }     from "@/shared/types/api"
import { cn }          from "@/shared/lib/tailwind-cn"
import { useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle2, Clock, CloudOff, RefreshCcw,
  RotateCcw, Save, Search, Wifi, XCircle,
} from "lucide-react"
import { useMemo, useState } from "react"

interface Student { id: string; name: string; avatar: string }
interface Props    { groupId: string; students: Student[] }

type Status = AttendanceStatus | "none"

const STATUS_CONFIG = {
  [AttendanceStatus.PRESENT]: {
    label:       "حاضر",
    activeClass: "bg-emerald-500 text-white shadow-sm",
    idleClass:   "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400",
    rowClass:    "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20",
  },
  [AttendanceStatus.LATE]: {
    label:       "متأخر",
    activeClass: "bg-amber-500 text-white shadow-sm",
    idleClass:   "border border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400",
    rowClass:    "border-amber-200 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-950/20",
  },
  [AttendanceStatus.ABSENT]: {
    label:       "غائب",
    activeClass: "bg-rose-500 text-white shadow-sm",
    idleClass:   "border border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400",
    rowClass:    "border-rose-200 bg-rose-50/60 dark:border-rose-800/50 dark:bg-rose-950/20",
  },
} as const

export function AttendanceClient({ groupId, students }: Props) {
  const qc = useQueryClient()
  const { isOnline, pending, syncing, lastSync, saveAttendance, syncQueue } = useOfflineAttendance()

  const [attendance,  setAttendance]  = useState<Record<string, Status>>(
    Object.fromEntries(students.map(s => [s.id, "none"]))
  )
  const [search,      setSearch]      = useState("")
  const [saved,       setSaved]       = useState(false)
  const [savedOffline, setSavedOffline] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saving,      setSaving]      = useState(false)

  const filtered = useMemo(
    () => students.filter(s => (s.name ?? "").toLowerCase().includes(search.toLowerCase())),
    [students, search]
  )

  const present = Object.values(attendance).filter(v => v === AttendanceStatus.PRESENT).length
  const late    = Object.values(attendance).filter(v => v === AttendanceStatus.LATE).length
  const absent  = Object.values(attendance).filter(v => v === AttendanceStatus.ABSENT).length
  const pending2 = students.length - present - late - absent

  const mark = (id: string, status: AttendanceStatus) =>
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? "none" : status }))

  const markAll = (status: AttendanceStatus) =>
    setAttendance(Object.fromEntries(students.map(s => [s.id, status])))

  const reset = () => {
    setAttendance(Object.fromEntries(students.map(s => [s.id, "none"])))
    setSaved(false); setSavedOffline(false); setError(null)
  }

  const today = new Date().toISOString().split("T")[0]

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const records = students.map(s => ({
      studentId: s.id,
      status:    attendance[s.id] === "none" ? AttendanceStatus.ABSENT : attendance[s.id] as AttendanceStatus,
    }))
    const res = await saveAttendance(groupId, today, records)
    setSaving(false)
    if (res.success) {
      if (res.offline) {
        setSavedOffline(true)
      } else {
        setSaved(true)
        // Bust ranking cache
        qc.invalidateQueries({ queryKey: ["groups", groupId, "ranking"], exact: false, refetchType: "active" })
      }
    } else {
      setError(res.error ?? "حدث خطأ أثناء الحفظ")
    }
  }

  return (
    <div className="flex flex-col">
      {/* Offline banner */}
      {!isOnline && (
        <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-white">
          <CloudOff className="size-3.5"/>
          وضع بدون إنترنت — سيتم مزامنة الحضور عند الاتصال تلقائياً
        </div>
      )}

      {/* Pending sync banner */}
      {isOnline && pending.length > 0 && (
        <div className="sticky top-0 z-40 flex items-center justify-between gap-2 bg-violet-600 px-4 py-2 text-xs font-semibold text-white">
          <span className="flex items-center gap-1.5">
            <Wifi className="size-3.5"/>
            {syncing ? "جارٍ مزامنة الحضور المحفوظ..." : `${pending.length} سجل حضور في انتظار الإرسال`}
          </span>
          {!syncing && (
            <button onClick={syncQueue} className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30 transition-colors">
              <RefreshCcw className="size-3"/>مزامنة الآن
            </button>
          )}
        </div>
      )}

      {/* Sticky stats bar */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-card px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-bold">{students.length} طالب</span>
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <CheckCircle2 className="size-4" />{present} حاضر
              </span>
              <span className="flex items-center gap-1 font-medium text-amber-600">
                <Clock className="size-4" />{late} متأخر
              </span>
              <span className="flex items-center gap-1 font-medium text-rose-600">
                <XCircle className="size-4" />{absent} غائب
              </span>
              {pending2 > 0 && (
                <span className="text-xs text-muted-foreground">{pending2} لم يُسجَّل</span>
              )}
            </div>
            <Button size="sm" variant="ghost" onClick={reset} className="text-muted-foreground">
              <RotateCcw className="size-3.5" />إعادة
            </Button>
          </div>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: students.length ? `${(present / students.length) * 100}%` : "0%" }}/>
            <div className="h-full bg-amber-400 transition-all duration-300"
              style={{ width: students.length ? `${(late / students.length) * 100}%` : "0%" }}/>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <p className="mb-4 text-xs text-muted-foreground">
          {new Date().toLocaleDateString("ar-EG", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>

        {error && (
          <div className="mb-4 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Points key */}
        <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3">
          <span className="text-xs font-medium text-muted-foreground">النقاط:</span>
          <span className="text-xs text-emerald-600 font-semibold">حاضر = 2 نقطة</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-xs text-amber-600 font-semibold">متأخر = 1 نقطة</span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-xs text-rose-600 font-semibold">غائب = 0 نقطة</span>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="ابحث عن طالب..."
            className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"/>
        </div>

        {/* Quick actions */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {([AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT] as const).map(status => (
            <button key={status} onClick={() => markAll(status)}
              className={cn("rounded-xl py-2 text-xs font-medium transition-colors",
                status === AttendanceStatus.PRESENT && "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400",
                status === AttendanceStatus.LATE    && "border border-amber-200  bg-amber-50  text-amber-700  hover:bg-amber-100  dark:border-amber-800  dark:bg-amber-950/30  dark:text-amber-400",
                status === AttendanceStatus.ABSENT  && "border border-rose-200   bg-rose-50   text-rose-700   hover:bg-rose-100   dark:border-rose-800   dark:bg-rose-950/30   dark:text-rose-400",
              )}>
              {STATUS_CONFIG[status].label} الكل
            </button>
          ))}
        </div>

        {/* Students list */}
        <div className="space-y-2">
          {filtered.map(s => {
            const status = attendance[s.id]
            const rowClass = status !== "none" ? STATUS_CONFIG[status].rowClass : "border-border/60 bg-card"
            return (
              <div key={s.id}
                className={cn("flex items-center gap-2.5 sm:gap-3 rounded-2xl border px-3 py-2.5 sm:px-4 sm:py-3 transition-all", rowClass)}>
                <span className="grid size-8 sm:size-9 place-items-center rounded-xl bg-violet-100 text-xs sm:text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                  {s.avatar}
                </span>
                <div className="min-w-0 flex-1 py-0.5">
                  <span className="text-xs sm:text-sm font-medium leading-snug break-words text-foreground block">
                    {s.name}
                  </span>
                </div>
                <div className="flex gap-1 sm:gap-1.5 shrink-0">
                  {([AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT] as const).map(st => (
                    <button key={st} onClick={() => mark(s.id, st)}
                      className={cn("rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all sm:px-3",
                        status === st ? STATUS_CONFIG[st].activeClass : STATUS_CONFIG[st].idleClass)}>
                      {STATUS_CONFIG[st].label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">لا يوجد طلاب مطابقون</div>
          )}
        </div>

        {/* Save button */}
        <div className="sticky bottom-20 mt-6 md:bottom-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg">
              <CheckCircle2 className="size-5" /> تم حفظ الحضور بنجاح!
            </div>
          ) : savedOffline ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg">
                <CloudOff className="size-5" /> تم الحفظ محلياً — سيُرسل عند الاتصال
              </div>
              <p className="text-center text-[10px] text-muted-foreground">
                {pending.length} سجل في الانتظار
              </p>
            </div>
          ) : (
            <Button size="lg" onClick={handleSave} disabled={saving}
              className={cn(
                "w-full text-white shadow-lg hover:opacity-90 disabled:opacity-50",
                isOnline
                  ? "bg-gradient-to-r from-violet-600 to-violet-500 shadow-violet-500/25"
                  : "bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-500/25"
              )}>
              {isOnline ? <Save className="size-4"/> : <CloudOff className="size-4"/>}
              {saving ? "جارٍ الحفظ..." : isOnline ? "حفظ الحضور" : "حفظ محلياً"}
            </Button>
          )}
          {lastSync && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              آخر مزامنة: {lastSync.toLocaleTimeString("ar-EG")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
