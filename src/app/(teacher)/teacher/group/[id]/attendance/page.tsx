"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { currentTeacher, getGroupById, getStudentsByGroup, mockNotifications } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { CheckCircle2, RotateCcw, Save, Search, XCircle } from "lucide-react"
import Link from "next/link"
import { use, useMemo, useState } from "react"

type Status = "present" | "absent" | "none"

const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

export default function AttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const group = getGroupById(id)
  const students = getStudentsByGroup(id)

  const [attendance, setAttendance] = useState<Record<string, Status>>(
    Object.fromEntries(students.map(s => [s.id, "none"]))
  )
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState(false)

  const filtered = useMemo(
    () => students.filter(s => s.name.includes(search)),
    [students, search]
  )

  const present = Object.values(attendance).filter(v => v === "present").length
  const absent  = Object.values(attendance).filter(v => v === "absent").length
  const pending = students.length - present - absent

  const mark = (id: string, status: Status) =>
    setAttendance(prev => ({ ...prev, [id]: prev[id] === status ? "none" : status }))

  const markAll = (status: Status) =>
    setAttendance(Object.fromEntries(students.map(s => [s.id, status])))

  const reset = () => {
    setAttendance(Object.fromEntries(students.map(s => [s.id, "none"])))
    setSaved(false)
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="تسجيل الحضور"
        subtitle={group?.name ?? ""}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      {/* Sticky stats bar */}
      <div className="sticky top-14 z-30 border-b border-border/60 bg-card px-4 py-3 shadow-sm sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="font-bold">{students.length} طالب</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="size-4"/>{present} حاضر
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <XCircle className="size-4"/>{absent} غائب
              </span>
              {pending > 0 && <span className="text-muted-foreground text-xs">{pending} لم يُسجَّل</span>}
            </div>
            <Button size="sm" variant="ghost" onClick={reset} className="text-muted-foreground">
              <RotateCcw className="size-3.5"/>إعادة
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(present / students.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        {/* Date */}
        <p className="mb-4 text-xs text-muted-foreground">الخميس ٢٧ أغسطس ٢٠٢٦</p>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن طالب..."
            className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Quick actions */}
        <div className="mb-4 flex gap-2">
          <button onClick={() => markAll("present")} className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
            ✓ تحضير الكل
          </button>
          <button onClick={() => markAll("absent")} className="flex-1 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-400">
            ✗ غياب الكل
          </button>
        </div>

        {/* Students list */}
        <div className="space-y-2">
          {filtered.map(s => {
            const status = attendance[s.id]
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                  status === "present" ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20"
                  : status === "absent" ? "border-rose-200 bg-rose-50/60 dark:border-rose-800/50 dark:bg-rose-950/20"
                  : "border-border/60 bg-card"
                )}
              >
                <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                  {s.avatar}
                </span>
                <span className="flex-1 text-sm font-medium">{s.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => mark(s.id, "present")}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                      status === "present"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    )}
                  >
                    حاضر
                  </button>
                  <button
                    onClick={() => mark(s.id, "absent")}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                      status === "absent"
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
        </div>

        {/* Save */}
        <div className="sticky bottom-20 mt-6 md:bottom-4">
          {saved ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg">
              <CheckCircle2 className="size-5"/> تم حفظ الحضور بنجاح!
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50"
              disabled={pending > 0}
              onClick={() => setSaved(true)}
            >
              <Save className="size-4"/>
              {pending > 0 ? `سجّل باقي ${pending} طالب أولاً` : "حفظ الحضور"}
            </Button>
          )}
          {saved && (
            <Button variant="outline" className="mt-2 w-full" asChild>
              <Link href={`/teacher/group/${id}`}>العودة للمجموعة</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
