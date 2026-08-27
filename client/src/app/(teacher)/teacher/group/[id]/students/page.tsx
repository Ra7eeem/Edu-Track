"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { currentTeacher, getGroupById, getStudentsByGroup, mockNotifications } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { CheckCircle2, Search, UserPlus, X } from "lucide-react"
import { use, useMemo, useState } from "react"

const unread = mockNotifications.filter(n => n.userId === currentTeacher.id && !n.read).length

export default function StudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const group = getGroupById(id)
  const students = getStudentsByGroup(id)
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [added, setAdded] = useState(false)

  const filtered = useMemo(
    () => students.filter(s => s.name.includes(search) || s.email.includes(search)),
    [students, search]
  )

  return (
    <div className="flex flex-col">
      <TopBar
        title="الطلاب"
        subtitle={group?.name}
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو البريد..."
              className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button size="sm" className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={() => { setShowModal(true); setAdded(false) }}>
            <UserPlus className="size-3.5"/>إضافة طالب
          </Button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{filtered.length} طالب</p>

        {/* List */}
        <div className="space-y-2">
          {filtered.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">{s.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.email}</p>
              </div>
              <div className="hidden flex-col items-end gap-1 sm:flex shrink-0">
                <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                <span className="text-xs text-muted-foreground">{s.score} نقطة</span>
              </div>
              <div className="ms-1 flex flex-col gap-1 shrink-0">
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">تعديل</button>
                <button className="text-xs text-rose-500 hover:text-rose-600 transition-colors">حذف</button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground/50 text-4xl mb-3">👤</p>
            <p className="font-medium">لا يوجد طلاب</p>
            <p className="text-sm text-muted-foreground mt-1">جرّب البحث بكلمة مختلفة</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">إضافة طالب جديد</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4"/></button>
            </div>

            {added ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500"/>
                <p className="font-bold">تم إنشاء حساب الطالب بنجاح!</p>
                <div className="mt-3 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
                  <p>البريد: طالب@example.com</p>
                  <p>كلمة المرور المؤقتة: <span className="font-mono font-bold text-foreground">Edu@2026</span></p>
                </div>
                <Button className="mt-4 w-full" onClick={() => setShowModal(false)}>إغلاق</Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); setAdded(true) }} noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="st-name">الاسم الكامل</Label>
                  <Input id="st-name" placeholder="محمد أحمد" required/>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="st-email">البريد الإلكتروني أو اسم المستخدم</Label>
                  <Input id="st-email" type="email" placeholder="student@example.com" required/>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="st-phone">رقم الهاتف <span className="text-muted-foreground">(اختياري)</span></Label>
                  <Input id="st-phone" type="tel" placeholder="01012345678"/>
                </div>
                <p className="text-xs text-muted-foreground">سيتم إنشاء كلمة مرور مؤقتة تلقائياً للطالب.</p>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>إلغاء</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90">إنشاء الحساب</Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
