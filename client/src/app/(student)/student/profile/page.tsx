"use client"

import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { logoutAction } from "@/features/auth/actions/logout.action"
import { useStudentMe, useStudentGroups, useStudentAttendance } from "@/features/student/hooks/use-student"
import { useNotifications } from "@/features/groups/hooks/use-notifications"
import { clientFetch } from "@/shared/lib/api-client"
import { cn } from "@/shared/lib/tailwind-cn"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, LogOut } from "lucide-react"
import { useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { z } from "zod"

const schema = z.object({
  name:  z.string().min(2),
  phone: z.string().min(7).optional().or(z.literal("")),
})
type F = z.infer<typeof schema>

export default function StudentProfilePage() {
  const [editing, setEditing] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const qc = useQueryClient()

  const { data: profile  } = useStudentMe()
  const { data: groups   } = useStudentGroups()
  const { data: notifData} = useNotifications()
  const firstGroup  = groups?.data?.[0]
  const { data: attendance } = useStudentAttendance(firstGroup?.id ?? "")
  const unread = (notifData?.data ?? []).filter(n => !n.isRead).length

  const { control, handleSubmit, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    values: { name: profile?.name ?? "", phone: profile?.phone ?? "" },
  })

  const updateMutation = useMutation({
    mutationFn: (values: F) =>
      clientFetch<unknown>("/api/students/me", { method: "PATCH", data: values } as never),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student", "me"] })
      setSaved(true)
      setEditing(false)
    },
  })

  const onSubmit = (values: F) => updateMutation.mutate(values)

  const records = (attendance ?? []) as Array<{ date: string; status: string }>

  return (
    <div className="flex flex-col">
      <TopBar
        title="حسابي"
        notifHref="/student/notifications"
        unreadCount={unread}
        userName={profile?.name ?? ""}
        userAvatar={(profile?.name ?? "أ")[0]}
        userAvatarColor="bg-cyan-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-lg p-4 sm:p-6 space-y-5">
        {/* Profile card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm text-center">
          <span className="grid size-20 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-3xl font-extrabold text-white shadow-lg">
            {(profile?.name ?? "أ")[0]}
          </span>
          <p className="mt-3 text-base font-bold">{profile?.name}</p>
          <p className="text-sm text-muted-foreground">{firstGroup?.name}</p>
        </div>

        {/* Attendance calendar */}
        {records.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold">
              سجل الحضور — {new Date().toLocaleDateString("ar-EG", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {records.map((r, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg text-xs font-medium",
                    r.status === "PRESENT"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {r.status === "PRESENT" ? "✓" : "✗"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit form */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">بيانات الحساب</h3>
            {!editing && (
              <button onClick={() => { setEditing(true); setSaved(false) }}
                className="text-xs text-primary hover:underline">تعديل</button>
            )}
          </div>

          {saved && !editing ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle2 className="mb-2 size-8 text-emerald-500" />
              <p className="font-semibold text-sm">تم حفظ التغييرات!</p>
              <Button className="mt-3" variant="outline" size="sm" onClick={() => setSaved(false)}>حسناً</Button>
            </div>
          ) : editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              {updateMutation.isError && (
                <p className="text-xs text-destructive">حدث خطأ، حاول مجدداً</p>
              )}
              <div className="space-y-1">
                <Label htmlFor="sname">الاسم</Label>
                <Controller name="name" control={control} render={({ field }) => (
                  <Input {...field} id="sname" error={!!errors.name} />
                )} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sphone">الهاتف</Label>
                <Controller name="phone" control={control} render={({ field }) => (
                  <Input {...field} id="sphone" type="tel" />
                )} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1" size="sm"
                  onClick={() => setEditing(false)}>إلغاء</Button>
                <Button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" size="sm"
                  disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "جارٍ الحفظ..." : "حفظ"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">الاسم</span>
                <span className="font-medium">{profile?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">البريد</span>
                <span className="font-medium text-xs">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">الهاتف</span>
                  <span className="font-medium">{profile.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="outline"
            className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20">
            <LogOut className="size-4" />تسجيل الخروج
          </Button>
        </form>
      </div>
    </div>
  )
}
