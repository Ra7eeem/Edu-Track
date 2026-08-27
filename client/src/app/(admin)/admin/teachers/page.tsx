"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { mockTeachers } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { CheckCircle2, Search, UserPlus, X } from "lucide-react"
import { useMemo, useState } from "react"

export default function AdminTeachersPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all"|"active"|"inactive">("all")
  const [showModal, setShowModal] = useState(false)
  const [added, setAdded] = useState(false)

  const filtered = useMemo(() => mockTeachers.filter(t => {
    const matchSearch = t.name.includes(search) || t.email.includes(search)
    const matchFilter = filter === "all" || t.status === filter
    return matchSearch && matchFilter
  }), [search, filter])

  return (
    <div className="flex flex-col">
      <TopBar title="إدارة المدرسين" notifHref="/admin/dashboard" userName="مدير" userAvatar="ا" userAvatarColor="bg-rose-500" profileHref="/admin/dashboard"/>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..."
              className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"/>
          </div>
          <div className="flex gap-1 rounded-xl border border-input bg-muted/40 p-1">
            {(["all","active","inactive"] as const).map(f => (
              <button key={f} onClick={()=>setFilter(f)}
                className={cn("rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  filter===f ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {f==="all"?"الكل":f==="active"?"نشط":"غير نشط"}
              </button>
            ))}
          </div>
          <Button size="sm" className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={()=>{setShowModal(true);setAdded(false)}}>
            <UserPlus className="size-3.5"/>إضافة مدرس
          </Button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{filtered.length} مدرس</p>

        {/* Table / cards */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {/* Desktop header */}
          <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 border-b border-border/40 px-5 py-3 text-xs font-medium text-muted-foreground sm:grid">
            <span/>
            <span>المدرس</span>
            <span className="text-center">المجموعات</span>
            <span className="text-center">الطلاب</span>
            <span className="text-center">الحالة</span>
            <span/>
          </div>
          {filtered.map((t, i) => (
            <div key={t.id} className={cn("grid items-center gap-3 px-4 py-3.5 sm:grid-cols-[auto_1fr_auto_auto_auto_auto] sm:gap-4 sm:px-5", i < filtered.length - 1 && "border-b border-border/40")}>
              <span className="hidden size-9 grid-place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 sm:grid shrink-0">
                {t.avatar}
              </span>
              <div className="flex items-center gap-3 sm:block">
                <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0 sm:hidden">
                  {t.avatar}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                  <p className="text-[10px] text-muted-foreground">آخر نشاط: {t.lastActive}</p>
                </div>
              </div>
              <span className="hidden text-center text-sm font-bold sm:block">{t.groupIds.length}</span>
              <span className="hidden text-center text-sm font-bold sm:block">{t.studentCount}</span>
              <span className="hidden sm:flex justify-center">
                <Badge variant={t.status==="active"?"secondary":"outline"} className={cn("text-[10px]", t.status==="active" && "bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                  {t.status==="active"?"نشط":"غير نشط"}
                </Badge>
              </span>
              <div className="flex gap-1 ms-auto sm:ms-0">
                <button className="rounded-lg px-2.5 py-1.5 text-xs text-primary border border-primary/20 hover:bg-primary/5 transition-colors">تعديل</button>
                <button className="rounded-lg px-2.5 py-1.5 text-xs text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20">حذف</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground/40 text-3xl mb-2">👨‍🏫</p>
              <p className="text-sm text-muted-foreground">لا يوجد مدرسون مطابقون</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">إضافة مدرس جديد</h2>
              <button onClick={()=>setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X className="size-4"/></button>
            </div>
            {added ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500"/>
                <p className="font-bold">تم إنشاء حساب المدرس بنجاح!</p>
                <p className="mt-1 text-sm text-muted-foreground">سيصله بريد إلكتروني ببيانات تسجيل الدخول.</p>
                <Button className="mt-4 w-full" onClick={()=>setShowModal(false)}>إغلاق</Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={e=>{e.preventDefault();setAdded(true)}} noValidate>
                <div className="space-y-1.5"><Label htmlFor="t-name">الاسم الكامل</Label><Input id="t-name" placeholder="أ. محمد أحمد" required/></div>
                <div className="space-y-1.5"><Label htmlFor="t-email">البريد الإلكتروني</Label><Input id="t-email" type="email" placeholder="teacher@example.com" required/></div>
                <div className="space-y-1.5"><Label htmlFor="t-subject">المادة</Label><Input id="t-subject" placeholder="رياضيات، لغة عربية..."/></div>
                <div className="space-y-1.5"><Label htmlFor="t-phone">رقم الهاتف <span className="text-muted-foreground">(اختياري)</span></Label><Input id="t-phone" type="tel"/></div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={()=>setShowModal(false)}>إلغاء</Button>
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
