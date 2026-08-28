"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  useAdminTeachers,
  useCreateTeacher,
  useDeleteTeacher,
  useToggleTeacherStatus,
} from "@/features/admin/hooks/use-admin"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, Search, UserPlus, X } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
})
type F = z.infer<typeof schema>

export default function AdminTeachersPage() {
  const [search,    setSearch]    = useState("")
  const [showModal, setShowModal] = useState(false)
  const [added,     setAdded]     = useState(false)

  const { data }    = useAdminTeachers(search)
  const teachers    = data ?? []
  const createMut   = useCreateTeacher()
  const deleteMut   = useDeleteTeacher()
  const toggleMut   = useToggleTeacherStatus()
  console.log(data)
  console.log(teachers)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = (values: F) => {
    createMut.mutate(values, {
      onSuccess: () => { setAdded(true); reset() },
    })
  }

  return (
    <div className="flex flex-col">
      <TopBar
        title="إدارة المدرسين"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو البريد..."
              className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            />
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={() => { setShowModal(true); setAdded(false) }}
          >
            <UserPlus className="size-3.5" />إضافة مدرس
          </Button>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{teachers.length} مدرس</p>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          {teachers.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${i < teachers.length - 1 ? "border-b border-border/40" : ""}`}
            >
              <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                {t.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.email}</p>
              </div>
              <span className={`hidden sm:inline-flex text-[10px] rounded-full px-2 py-0.5 ${t.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700"}`}>
                {t.isActive ? "نشط" : "غير نشط"}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => toggleMut.mutate({ id: t.id, isActive: !t.isActive })}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  {t.isActive ? "تعطيل" : "تفعيل"}
                </button>
                <button
                  onClick={() => confirm("هل أنت متأكد؟") && deleteMut.mutate(t.id)}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors dark:border-rose-800"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <div className="py-16 text-center text-sm text-muted-foreground">
              لا يوجد مدرسون مطابقون
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">إضافة مدرس جديد</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            {added ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
                <p className="font-bold">تم إنشاء حساب المدرس بنجاح!</p>
                <Button className="mt-4 w-full" onClick={() => setShowModal(false)}>إغلاق</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {createMut.isError && (
                  <p className="text-xs text-destructive">حدث خطأ، حاول مجدداً</p>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="t-name">الاسم الكامل</Label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <Input {...field} id="t-name" placeholder="أ. محمد أحمد" error={!!errors.name} />
                  )} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="t-email">البريد الإلكتروني</Label>
                  <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} id="t-email" type="email" placeholder="teacher@example.com" error={!!errors.email} />
                  )} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="t-pass">كلمة المرور</Label>
                  <Controller name="password" control={control} render={({ field }) => (
                    <Input {...field} id="t-pass" type="text" placeholder="Edu@Teacher2026" error={!!errors.password} />
                  )} />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>إلغاء</Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" disabled={createMut.isPending}>
                    {createMut.isPending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
