"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { addStudentAction } from "@/features/teacher/actions/student.action"
import { removeStudentAction } from "@/features/teacher/actions/student.action"
import { useGroupStudents } from "@/features/teacher/hooks/use-group-students"
import { Grade, GRADE_LABELS, ApiGroupMembership } from "@/shared/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, ChevronDown, Search, UserPlus, X } from "lucide-react"
import { useActionState, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const addSchema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email:    z.string().email("البريد غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phone:    z.string().min(7, "رقم الهاتف غير صالح"),
  grade:    z.nativeEnum(Grade, { required_error: "الصف مطلوب" }),
})
type AddFormValues = z.infer<typeof addSchema>

interface Props {
  groupId:         string
  initialStudents: ApiGroupMembership[]
}

export function StudentsClient({ groupId, initialStudents }: Props) {
  const [search,     setSearch]     = useState("")
  const [showModal,  setShowModal]  = useState(false)
  const [removing,   setRemoving]   = useState<string | null>(null)
  const [removeErr,  setRemoveErr]  = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()

  // Prefer live data from React Query, fall back to SSR data
  const { data } = useGroupStudents(groupId, search)
  const students = data?.data ?? initialStudents

  const [state, formAction] = useActionState(addStudentAction, {})

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", grade: undefined },
  })

  const onSubmit = (values: AddFormValues) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => fd.set(k, v))
    fd.set("groupId", groupId)
    startTransition(() => formAction(fd))
  }

  const handleRemove = (studentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطالب؟")) return
    setRemoving(studentId)
    startTransition(async () => {
      const res = await removeStudentAction(groupId, studentId)
      if (res.error) setRemoveErr(res.error)
      setRemoving(null)
    })
  }

  const fieldErr = (f: keyof AddFormValues) =>
    errors[f]?.message ?? state.fieldErrors?.[f]?.[0]

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {/* Toolbar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
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
          onClick={() => { setShowModal(true) }}
        >
          <UserPlus className="size-3.5" />إضافة طالب
        </Button>
      </div>

      {removeErr && (
        <div className="mb-3 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {removeErr}
        </div>
      )}

      <p className="mb-3 text-xs text-muted-foreground">{students.length} طالب</p>

      {/* List */}
      <div className="space-y-2">
        {students.map((m, i) => {
          const name = (m.student as { name?: string } | undefined)?.name ?? m.studentId
          const avatar = name[0] ?? "؟"
          return (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm"
            >
              <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                {avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {(m.student as { email?: string } | undefined)?.email ?? ""}
                </p>
              </div>
              <button
                disabled={removing === m.studentId || isPending}
                onClick={() => handleRemove(m.studentId)}
                className="text-xs text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-40"
              >
                حذف
              </button>
            </div>
          )
        })}

        {students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-4xl mb-3">👤</p>
            <p className="font-medium">لا يوجد طلاب</p>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">إضافة طالب جديد</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {state.success ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
                <p className="font-bold">تم إنشاء حساب الطالب بنجاح!</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => { setShowModal(false); reset() }}
                >
                  إغلاق
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3"
                noValidate
              >
                {state.error && (
                  <p className="text-xs text-destructive">{state.error}</p>
                )}

                <div className="space-y-1">
                  <Label htmlFor="st-name">الاسم الكامل</Label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <Input {...field} id="st-name" placeholder="محمد أحمد" error={!!fieldErr("name")} />
                  )} />
                  {fieldErr("name") && <p className="text-xs text-destructive">{fieldErr("name")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-email">البريد الإلكتروني</Label>
                  <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} id="st-email" type="email" placeholder="student@example.com" error={!!fieldErr("email")} />
                  )} />
                  {fieldErr("email") && <p className="text-xs text-destructive">{fieldErr("email")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-phone">رقم الهاتف</Label>
                  <Controller name="phone" control={control} render={({ field }) => (
                    <Input {...field} id="st-phone" type="tel" placeholder="01012345678" error={!!fieldErr("phone")} />
                  )} />
                  {fieldErr("phone") && <p className="text-xs text-destructive">{fieldErr("phone")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-grade">الصف الدراسي</Label>
                  <Controller name="grade" control={control} render={({ field }) => (
                    <div className="relative">
                      <select
                        {...field}
                        id="st-grade"
                        className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
                      >
                        <option value="">-- اختر الصف --</option>
                        {Object.entries(GRADE_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  )} />
                  {fieldErr("grade") && <p className="text-xs text-destructive">{fieldErr("grade")}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="st-pass">كلمة مرور مؤقتة</Label>
                  <Controller name="password" control={control} render={({ field }) => (
                    <Input {...field} id="st-pass" type="text" placeholder="Edu@2026" error={!!fieldErr("password")} />
                  )} />
                  {fieldErr("password") && <p className="text-xs text-destructive">{fieldErr("password")}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                    disabled={isPending}
                  >
                    {isPending ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
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
