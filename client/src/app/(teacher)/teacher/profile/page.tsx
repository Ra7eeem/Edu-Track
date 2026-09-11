"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { logoutAction } from "@/features/auth/actions/logout.action"
import { updateTeacherProfileAction } from "@/features/teacher/actions/profile.action"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, LogOut } from "lucide-react"
import { useActionState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { clientFetch, clearTokenCache } from "@/shared/lib/api-client"
import { ApiUser } from "@/shared/types/api"

const schema = z.object({
  name:  z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل"),
  phone: z.string().min(7, "رقم الهاتف غير صالح").optional().or(z.literal("")),
})
type FormValues = z.infer<typeof schema>

export default function TeacherProfilePage() {
  const { data: profile } = useQuery({
    queryKey: ["teacher", "profile"],
    queryFn:  () => clientFetch<ApiUser>("/api/teacher/profile"),
  })

  const [state,   formAction] = useActionState(updateTeacherProfileAction, {})
  const [pending, startTransition] = useTransition()

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { name: profile?.name ?? "", phone: profile?.phone ?? "" },
  })

  const onSubmit = (values: FormValues) => {
    const fd = new FormData()
    if (values.name)  fd.set("name",  values.name)
    if (values.phone) fd.set("phone", values.phone)
    startTransition(() => formAction(fd))
  }

  const unread = 0

  return (
    <div className="flex flex-col">
      <TopBar
        title="الحساب"
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={profile?.name ?? ""}
        userAvatar={(profile?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-xl p-4 sm:p-6">
        {/* Avatar */}
        <div className="mb-6 flex flex-col items-center">
          <span className="grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-violet-700 text-3xl font-extrabold text-white shadow-lg">
            {(profile?.name ?? "م")[0]}
          </span>
          <p className="mt-3 text-base font-bold">{profile?.name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>

        {/* Edit form */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-bold">تعديل البيانات</h2>

          {state.success ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="mb-2 size-10 text-emerald-500" />
              <p className="font-semibold">تم حفظ التغييرات!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {state.error && (
                <p className="text-xs text-destructive">{state.error}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="name">الاسم</Label>
                <Controller name="name" control={control} render={({ field }) => (
                  <Input {...field} id="name" error={!!errors.name} />
                )} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Controller name="phone" control={control} render={({ field }) => (
                  <Input {...field} id="phone" type="tel" error={!!errors.phone} />
                )} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
                disabled={pending}
              >
                {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </form>
          )}
        </div>

        <form action={logoutAction} onSubmit={() => clearTokenCache()} className="mt-4">
          <Button
            type="submit"
            variant="outline"
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
          >
            <LogOut className="size-4" />تسجيل الخروج
          </Button>
        </form>
      </div>
    </div>
  )
}
