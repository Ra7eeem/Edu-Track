"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { ListRowSkeleton } from "@/shared/components/ui/skeleton"
import {
  useAdminTeachers,
  useCreateTeacher,
  useDeleteTeacher,
  useToggleTeacherStatus,
} from "@/features/admin/hooks/use-admin"
import { ApiUser, resolveId } from "@/shared/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email:    z.string().email("البريد غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
})
type F = z.infer<typeof schema>

export default function AdminTeachersPage() {
  const [search,       setSearch]       = useState("")
  const [showAdd,      setShowAdd]      = useState(false)
  const [added,        setAdded]        = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)

  const { data: teachers = [], isLoading, isError } = useAdminTeachers(search)
  const createMut = useCreateTeacher()
  const deleteMut = useDeleteTeacher()
  console.log(deleteMut)
  const toggleMut = useToggleTeacherStatus()

  const { control, handleSubmit, reset, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = (values: F) => {
    createMut.mutate(values, {
      onSuccess: () => { setAdded(true); reset() },
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    deleteMut.mutate(resolveId(deleteTarget), {
      onSuccess: () => setDeleteTarget(null),
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
            onClick={() => { setShowAdd(true); setAdded(false) }}
          >
            <UserPlus className="size-3.5" />إضافة مدرس
          </Button>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={i < 4 ? "border-b border-border/40" : ""}>
                <ListRowSkeleton cols={4} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            حدث خطأ أثناء تحميل البيانات. حاول مرة أخرى.
          </div>
        )}

        {/* List */}
        {!isLoading && !isError && (
          <>
            <p className="mb-3 text-xs text-muted-foreground">{teachers.length} مدرس</p>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              {teachers.map((t, i) => (
                <div
                  key={t._id}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${i < teachers.length - 1 ? "border-b border-border/40" : ""}`}
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                    {t.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.email}</p>
                  </div>
                  <span className={`hidden sm:inline-flex text-[10px] rounded-full px-2 py-0.5 font-medium ${
                    t.isActive
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  }`}>
                    {t.isActive ? "نشط" : "غير نشط"}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleMut.mutate({ id: t._id!, isActive: !t.isActive })}
                      disabled={toggleMut.isPending}
                      className="rounded-xl px-2.5 py-1.5 text-xs text-primary border border-primary/20 hover:bg-primary/5 transition-colors disabled:opacity-40"
                    >
                      {t.isActive ? "تعطيل" : "تفعيل"}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(t)}
                      className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20"
                      aria-label="حذف المدرس"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {teachers.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-3xl mb-2">👨‍🏫</p>
                  <p className="text-sm text-muted-foreground">لا يوجد مدرسون مطابقون</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Add Teacher Modal ─────────────────────────────────────── */}
      {showAdd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">إضافة مدرس جديد</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {added ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
                <p className="text-base font-bold">تم إنشاء الحساب بنجاح!</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  سيتمكن المدرس من تسجيل الدخول باستخدام البريد وكلمة المرور التي حددتها.
                </p>
                <Button className="mt-5 w-full" onClick={() => { setShowAdd(false); setAdded(false) }}>
                  إغلاق
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {createMut.isError && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    حدث خطأ أثناء إنشاء الحساب. حاول مرة أخرى.
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="t-name">الاسم الكامل</Label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <Input {...field} id="t-name" placeholder="أ. محمد أحمد" error={!!errors.name} />
                  )} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-email">البريد الإلكتروني</Label>
                  <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} id="t-email" type="email" placeholder="teacher@example.com" error={!!errors.email} />
                  )} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-pass">كلمة المرور</Label>
                  <Controller name="password" control={control} render={({ field }) => (
                    <Input {...field} id="t-pass" type="text" placeholder="Edu@Teacher2026" error={!!errors.password} />
                  )} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAdd(false)}>
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                    disabled={createMut.isPending}
                  >
                    {createMut.isPending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
        >
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                <AlertTriangle className="size-7" />
              </span>
            </div>

            <h2 className="text-center text-base font-bold">حذف المدرس</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
              هل أنت متأكد من حذف حساب{" "}
              <span className="font-semibold text-foreground">{deleteTarget.name}</span>؟
            </p>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              سيتم حذف الحساب نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </p>

            {deleteMut.isError && (
              <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
                حدث خطأ أثناء الحذف. حاول مرة أخرى.
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMut.isPending}
              >
                إلغاء
              </Button>
              <Button
                className="flex-1 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400"
                onClick={confirmDelete}
                disabled={deleteMut.isPending}
              >
                {deleteMut.isPending ? "جارٍ الحذف..." : "نعم، احذف"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
