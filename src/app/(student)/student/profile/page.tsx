"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { currentStudent, currentStudentGroup, getNotificationsByUser } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { CheckCircle2, LogOut } from "lucide-react"
import { useState } from "react"

const notifs = getNotificationsByUser(currentStudent.id)
const unread = notifs.filter(n => !n.read).length

// Mock attendance calendar — last 22 sessions
const attendanceHistory = Array.from({length: 22}, (_, i) => ({
  day: i + 1,
  status: [0,4,8,15].includes(i) ? "absent" : "present",
}))

export default function StudentProfilePage() {
  const [editing, setEditing] = useState(false)
  const [saved, setSaved]   = useState(false)

  return (
    <div className="flex flex-col">
      <TopBar
        title="حسابي"
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={currentStudent.name}
        userAvatar={currentStudent.avatar}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-lg p-4 sm:p-6 space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm text-center">
          <div className="relative inline-block">
            <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-3xl font-extrabold text-white shadow-lg">
              {currentStudent.avatar}
            </span>
            {editing && (
              <button className="absolute -bottom-1 -end-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm text-[10px]">✏️</button>
            )}
          </div>
          <p className="mt-3 text-base font-bold">{currentStudent.name}</p>
          <p className="text-sm text-muted-foreground">{currentStudentGroup.name}</p>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3">
            <div className="text-center"><p className="text-xl font-extrabold text-emerald-600">{currentStudent.attendanceCount}</p><p className="text-[10px] text-muted-foreground">حضور</p></div>
            <div className="text-center"><p className="text-xl font-extrabold text-primary">{currentStudent.score}</p><p className="text-[10px] text-muted-foreground">نقطة</p></div>
            <div className="text-center"><p className="text-xl font-extrabold text-amber-600">#{currentStudent.rank}</p><p className="text-[10px] text-muted-foreground">ترتيبي</p></div>
          </div>
        </div>

        {/* Attendance calendar */}
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold">سجل الحضور — أغسطس ٢٠٢٦</h3>
          <div className="flex flex-wrap gap-1.5">
            {attendanceHistory.map(d => (
              <div key={d.day} className={cn(
                "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
                d.status === "present" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
              )}>
                {d.status === "present" ? "✓" : "✗"}
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-emerald-500"/>حاضر ({attendanceHistory.filter(d=>d.status==="present").length})</span>
            <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-rose-400"/>غائب ({attendanceHistory.filter(d=>d.status==="absent").length})</span>
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">بيانات الحساب</h3>
            {!editing && <button onClick={() => setEditing(true)} className="text-xs text-primary hover:underline">تعديل</button>}
          </div>
          {saved ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 className="mb-2 size-8 text-emerald-500"/>
              <p className="font-semibold text-sm">تم حفظ التغييرات!</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => { setSaved(false); setEditing(false) }}>حسناً</Button>
            </div>
          ) : editing ? (
            <form className="space-y-3" onSubmit={e=>{e.preventDefault();setSaved(true)}} noValidate>
              <div className="space-y-1"><Label htmlFor="sname">الاسم</Label><Input id="sname" defaultValue={currentStudent.name}/></div>
              <div className="space-y-1"><Label htmlFor="semail">البريد</Label><Input id="semail" type="email" defaultValue={currentStudent.email}/></div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" size="sm" onClick={() => setEditing(false)}>إلغاء</Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" size="sm">حفظ</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">الاسم</span><span className="font-medium">{currentStudent.name}</span></div>
              <div className="flex items-center justify-between py-1 border-b border-border/40"><span className="text-muted-foreground">البريد</span><span className="font-medium text-xs">{currentStudent.email}</span></div>
              <div className="flex items-center justify-between py-1"><span className="text-muted-foreground">المجموعة</span><span className="font-medium text-xs">{currentStudentGroup.name}</span></div>
            </div>
          )}
        </div>

        <Button variant="outline" className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20" asChild>
          <a href="/login"><LogOut className="size-4"/>تسجيل الخروج</a>
        </Button>
      </div>
    </div>
  )
}
