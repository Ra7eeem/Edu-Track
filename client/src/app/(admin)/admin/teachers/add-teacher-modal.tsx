"use client"

import { createTeacherAction, TeacherActionState } from "@/features/admin/actions/teacher.action"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, X } from "lucide-react"
import { useActionState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const schema = z.object({
  name:     z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  email:    z.string().email("البريد غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
})
type F = z.infer<typeof schema>

export function AddTeacherModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<TeacherActionState, FormData>(createTeacherAction, {})

  const { control, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = (values: F) => {
    const fd = new FormData()
    fd.set("name", values.name)
    fd.set("email", values.email)
    fd.set("password", values.password)
    formAction(fd)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
        {state.success ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto mb-3 size-12 text-emerald-500" />
            <p className="text-base font-bold">تم إنشاء الحساب بنجاح!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              سيتمكن المدرس من تسجيل الدخول باستخدام البريد وكلمة المرور التي حددتها.
            </p>
            <Button className="mt-5 w-full" onClick={onClose}>
              إغلاق
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">إضافة مدرس جديد</h2>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {state.error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {state.error}
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
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
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
          </>
        )}
      </div>
    </div>
  )
}