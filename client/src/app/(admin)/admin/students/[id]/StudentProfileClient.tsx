"use client"

import { useAdminStudentProfile } from "@/features/admin/hooks/use-admin-student"
import { AttendanceStatus, GRADE_LABELS } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { 
  ArrowLeft, CalendarCheck, CheckCircle2, 
  GraduationCap, BookOpen, Clock
} from "lucide-react"
import Link from "next/link"

const AR_MONTHS = [
  "", "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
]

const STATUS_STYLES: Record<string, string> = {
  [AttendanceStatus.PRESENT]: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  [AttendanceStatus.LATE]:    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  [AttendanceStatus.ABSENT]:  "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
}

const STATUS_LABEL: Record<string, string> = {
  [AttendanceStatus.PRESENT]: "✓",
  [AttendanceStatus.LATE]:    "م",
  [AttendanceStatus.ABSENT]:  "✗",
}

export function StudentProfileClient({ studentId }: { studentId: string }) {
  const { data, isLoading, isError } = useAdminStudentProfile(studentId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/60 bg-muted"/>)}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-border/60 bg-card text-muted-foreground shadow-sm">
        <p>حدث خطأ أثناء تحميل بيانات الطالب</p>
      </div>
    )
  }

  const { student, groups, scores, attendanceRecords, examSubmissions } = data

  const byMonth: Record<string, { date: string; status: string }[]> = {}
  for (const r of attendanceRecords) {
    const d   = new Date(r.date)
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`
    if (!byMonth[key]) byMonth[key] = []
    byMonth[key].push(r)
  }

  return (
    <div className="space-y-5">
      <Link href="/admin/academic-stages" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit">
        <ArrowLeft className="size-3.5"/>العودة للمراحل
      </Link>

      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-2xl font-extrabold text-primary-foreground shadow-md">
          {(student.name ?? "؟")[0]}
        </span>
        <div className="min-w-0">
          <p className="text-base font-bold">{student.name}</p>
          <p className="text-sm text-muted-foreground">{student.email}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {student.grade && (
              <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                <GraduationCap className="size-3" />
                {GRADE_LABELS[student.grade] ?? student.grade}
              </span>
            )}
            {student.phone && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {student.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm h-fit">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <BookOpen className="size-3.5 text-primary"/>المجموعات الحالية
          </h3>
          {groups.length > 0 ? (
            <div className="space-y-2">
              {groups.map(g => (
                <Link key={g.id || g._id} href={`/admin/group/${g.id || g._id}`} className="block rounded-xl border border-border/40 bg-muted/30 p-3 hover:border-primary/30 transition-colors">
                  <p className="font-semibold text-sm">{g.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">لا ينتمي لأي مجموعة حالياً</p>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 className="size-3.5 text-primary"/>النقاط الشهرية (كافة المجموعات)
          </h3>
          {scores.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {scores.slice(0, 4).map((s, i) => (
                <div key={i} className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <p className="text-[10px] text-muted-foreground">{AR_MONTHS[s.month]} {s.year}</p>
                  <p className="text-lg font-bold text-primary">{s.score}</p>
                  <div className="mt-1 flex gap-1.5 text-[9px]">
                    <span className="text-emerald-600">{s.presentCount}✓</span>
                    {s.lateCount > 0 && <span className="text-amber-600">{s.lateCount}م</span>}
                    {s.absentCount > 0 && <span className="text-rose-600">{s.absentCount}✗</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد نقاط شهرية مسجلة</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Clock className="size-3.5 text-primary"/>نتائج الامتحانات
        </h3>
        {examSubmissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium rounded-r-lg">الامتحان</th>
                  <th className="px-4 py-2 font-medium">الدرجة</th>
                  <th className="px-4 py-2 font-medium">النسبة</th>
                  <th className="px-4 py-2 font-medium rounded-l-lg">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {examSubmissions.map((ex, i) => {
                  const percentage = ex.total ? Math.round(((ex.score || 0) / ex.total) * 100) : 0;
                  return (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 font-medium">{ex.assignment?.title || "امتحان"}</td>
                      <td className="px-4 py-3 font-bold text-primary">{ex.score} / {ex.total}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[11px] font-bold",
                          percentage >= 85 ? "bg-emerald-100 text-emerald-700" :
                          percentage >= 50 ? "bg-amber-100 text-amber-700" :
                          "bg-rose-100 text-rose-700"
                        )}>
                          {percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(ex.submittedAt).toLocaleDateString("ar-EG")}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">لم يقم بتسليم أي امتحانات</p>
        )}
      </div>

      {Object.keys(byMonth).length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <CalendarCheck className="size-3.5 text-primary"/>سجل الحضور (كافة المجموعات)
          </h3>
          <div className="space-y-4">
            {Object.entries(byMonth).map(([key, recs]) => {
              const [y, m] = key.split("-")
              return (
                <div key={key}>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">
                    {AR_MONTHS[Number(m)]} {y}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recs.map((r, i) => {
                      const day = new Date(r.date).getUTCDate()
                      return (
                        <div key={i} title={new Date(r.date).toLocaleDateString("ar-EG")}
                          className={cn(
                            "flex size-9 flex-col items-center justify-center rounded-xl text-[10px] font-bold",
                            STATUS_STYLES[r.status] ?? "bg-muted text-muted-foreground"
                          )}>
                          <span>{day}</span>
                          <span className="text-[8px]">{STATUS_LABEL[r.status] ?? "—"}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
