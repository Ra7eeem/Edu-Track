"use client"

import { useAttendanceRegister } from "@/features/teacher/hooks/use-student-profile"
import { cn } from "@/shared/lib/tailwind-cn"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

const AR_MONTHS = [
  "", "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]

const STATUS_CELL: Record<string, { label: string; cls: string }> = {
  PRESENT: { label: "✓", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  LATE:    { label: "م", cls: "bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400"  },
  ABSENT:  { label: "✗", cls: "bg-rose-100   text-rose-700   dark:bg-rose-900/30   dark:text-rose-400"   },
}

interface Props {
  groupId: string
  role?:   "teacher" | "admin"
}

export function AttendanceRegister({ groupId, role = "teacher" }: Props) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year,  setYear]  = useState(now.getFullYear())

  const { data, isLoading } = useAttendanceRegister(groupId, month, year, role)

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const dates   = data?.dates    ?? []
  const students = data?.students ?? []

  // Summary per student
  const summary = (records: { status: string }[]) => ({
    present: records.filter(r => r.status === "PRESENT").length,
    late:    records.filter(r => r.status === "LATE").length,
    absent:  records.filter(r => r.status === "ABSENT").length,
  })

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <button onClick={prevMonth}
          className="grid size-8 place-items-center rounded-xl hover:bg-muted transition-colors">
          <ChevronRight className="size-4"/>
        </button>
        <p className="text-sm font-bold">{AR_MONTHS[month]} {year}</p>
        <button onClick={nextMonth}
          className="grid size-8 place-items-center rounded-xl hover:bg-muted transition-colors">
          <ChevronLeft className="size-4"/>
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-2xl border border-border/60 bg-muted"/>
          ))}
        </div>
      ) : dates.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center rounded-2xl border border-dashed border-border">
          <p className="text-3xl mb-3">📅</p>
          <p className="font-medium">لا توجد سجلات حضور لهذا الشهر</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-border/40 bg-muted/20 text-[10px]">
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center text-[8px]">✓</span>حاضر</span>
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-amber-100  text-amber-700  flex items-center justify-center text-[8px]">م</span>متأخر</span>
            <span className="flex items-center gap-1"><span className="size-3 rounded bg-rose-100   text-rose-700   flex items-center justify-center text-[8px]">✗</span>غائب</span>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="min-w-max w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="sticky right-0 bg-muted/30 px-4 py-2.5 text-right font-semibold whitespace-nowrap min-w-[130px] z-10">
                    الطالب
                  </th>
                  {dates.map(d => {
                    const day = new Date(d).getUTCDate()
                    return (
                      <th key={d} className="px-1.5 py-2.5 font-semibold text-center text-muted-foreground">
                        {day}
                      </th>
                    )
                  })}
                  <th className="px-3 py-2.5 font-semibold text-center text-emerald-600 whitespace-nowrap">حضور</th>
                  <th className="px-3 py-2.5 font-semibold text-center text-amber-600  whitespace-nowrap">تأخير</th>
                  <th className="px-3 py-2.5 font-semibold text-center text-rose-600   whitespace-nowrap">غياب</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => {
                  const { present, late, absent } = summary(s.records)
                  return (
                    <tr key={s.id}
                      className={cn("border-b border-border/30 transition-colors hover:bg-muted/20",
                        i % 2 === 0 ? "bg-background" : "bg-muted/10")}>
                      {/* Sticky name column */}
                      <td className={cn(
                        "sticky right-0 px-4 py-2 font-medium whitespace-nowrap z-10",
                        i % 2 === 0 ? "bg-background" : "bg-muted/10"
                      )}>
                        {s.name}
                      </td>
                      {s.records.map((r, j) => {
                        const cell = STATUS_CELL[r.status] ?? { label: "—", cls: "text-muted-foreground" }
                        return (
                          <td key={j} className="px-1 py-2 text-center">
                            <span className={cn(
                              "inline-flex size-6 items-center justify-center rounded-md text-[9px] font-bold",
                              cell.cls
                            )}>
                              {cell.label}
                            </span>
                          </td>
                        )
                      })}
                      <td className="px-3 py-2 text-center font-bold text-emerald-600">{present}</td>
                      <td className="px-3 py-2 text-center font-bold text-amber-600">{late}</td>
                      <td className="px-3 py-2 text-center font-bold text-rose-600">{absent}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border/60 bg-muted/20 shadow-sm">
                  <td className="sticky right-0 bg-muted/20 px-4 py-3 font-bold whitespace-nowrap z-10 border-e border-border/40 text-[11px] text-muted-foreground">
                    الإجمالي اليومي
                    <div className="mt-1 flex flex-col gap-1 font-normal text-[9px]">
                      <span className="text-emerald-600">✓ حاضر</span>
                      <span className="text-amber-600">م متأخر</span>
                      <span className="text-rose-600">✗ غائب</span>
                    </div>
                  </td>
                  {dates.map((_, j) => {
                    let present = 0;
                    let late = 0;
                    let absent = 0;
                    students.forEach(s => {
                      const status = s.records[j]?.status;
                      if (status === "PRESENT") present++;
                      if (status === "LATE") late++;
                      if (status === "ABSENT") absent++;
                    });
                    
                    return (
                      <td key={j} className="px-1 py-3 text-center border-e border-border/40">
                        <div className="flex flex-col gap-1 items-center justify-center">
                          <span className="text-[10px] font-bold text-emerald-600">{present}</span>
                          <span className="text-[10px] font-bold text-amber-600">{late}</span>
                          <span className="text-[10px] font-bold text-rose-600">{absent}</span>
                        </div>
                      </td>
                    )
                  })}
                  <td colSpan={3} className="bg-muted/20"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
