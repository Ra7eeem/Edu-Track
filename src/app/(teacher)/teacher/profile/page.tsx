"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { currentTeacher, mockGroups, mockNotifications } from "@/shared/data/mock"
import { CheckCircle2, LogOut } from "lucide-react"
import { useState } from "react"

const teacherGroups = mockGroups.filter(g => g.teacherIds.includes(currentTeacher.id))
const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

export default function TeacherProfilePage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="flex flex-col">
      <TopBar
        title="الحساب"
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-xl p-4 sm:p-6">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 text-3xl font-extrabold text-white shadow-lg">
              {currentTeacher.avatar}
            </span>
            <button className="absolute -bottom-1 -end-1 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm">
              <span className="text-[10px]">✏️</span>
            </button>
          </div>
          <p className="mt-3 text-base font-bold">{currentTeacher.name}</p>
          <p className="text-sm text-muted-foreground">{currentTeacher.subject}</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="text-center">
            <p className="text-xl font-extrabold text-primary">{teacherGroups.length}</p>
            <p className="text-xs text-muted-foreground">مجموعة</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-cyan-600">{currentTeacher.studentCount}</p>
            <p className="text-xs text-muted-foreground">طالب</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-extrabold text-emerald-600">٨٦٪</p>
            <p className="text-xs text-muted-foreground">معدل حضور</p>
          </div>
        </div>

        {/* Edit form */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold">تعديل البيانات</h2>
          {saved ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="mb-2 size-10 text-emerald-500"/>
              <p className="font-semibold">تم حفظ التغييرات!</p>
              <Button className="mt-4" variant="outline" onClick={() => setSaved(false)}>تعديل مجدداً</Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={e => { e.preventDefault(); setSaved(true) }} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="name">الاسم</Label>
                <Input id="name" defaultValue={currentTeacher.name}/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" defaultValue={currentTeacher.email}/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input id="phone" type="tel" defaultValue={currentTeacher.phone}/>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">المادة</Label>
                <Input id="subject" defaultValue={currentTeacher.subject}/>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90">
                حفظ التغييرات
              </Button>
            </form>
          )}
        </div>

        {/* Logout */}
        <Button variant="outline" className="mt-4 w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20" asChild>
          <a href="/login"><LogOut className="size-4"/>تسجيل الخروج</a>
        </Button>
      </div>
    </div>
  )
}
