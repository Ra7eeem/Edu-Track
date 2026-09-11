"use client"

import { Button }      from "@/shared/components/ui/button"
import { Input }       from "@/shared/components/ui/input"
import { Label }       from "@/shared/components/ui/label"
import { logoutAction } from "@/features/auth/actions/logout.action"
import { updateAdminProfileAction, AdminProfileActionState } from "@/features/admin/actions/profile.action"
import { clearTokenCache } from "@/shared/lib/api-client"
import { ApiUser }     from "@/shared/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, KeyRound, LogOut, Pencil, User } from "lucide-react"
import { useActionState, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { cn } from "@/shared/lib/tailwind-cn"

// ─── Schemas ──────────────────────────────────────────────────────────────────
const infoSchema = z.object({
  name:  z.string().min(2, "الاسم حرفان على الأقل"),
  phone: z.string().min(7, "رقم الهاتف غير صالح").optional().or(z.literal("")),
})
const pwSchema = z.object({
  oldPassword: z.string().min(8, "8 أحرف على الأقل"),
  newPassword: z.string().min(8, "8 أحرف على الأقل"),
  confirmPw:   z.string(),
}).refine(d => d.newPassword === d.confirmPw, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPw"],
})

type InfoF = z.infer<typeof infoSchema>
type PwF   = z.infer<typeof pwSchema>

export function AdminProfileClient({ profile }: { profile: ApiUser }) {
  const [tab, setTab] = useState<"info" | "password">("info")

  // ── Info form ──────────────────────────────────────────────────────────────
  const [infoState, infoAction, infoPending] = useActionState<AdminProfileActionState, FormData>(updateAdminProfileAction, {})

  const infoForm = useForm<InfoF>({
    resolver: zodResolver(infoSchema),
    values: { name: profile.name ?? "", phone: profile.phone ?? "" },
  })

  const onInfoSubmit = (vals: InfoF) => {
    const fd = new FormData()
    if (vals.name)  fd.set("name",  vals.name)
    if (vals.phone) fd.set("phone", vals.phone)
    infoAction(fd)
  }

  // ── Password form ──────────────────────────────────────────────────────────
  const [pwState, pwAction, pwPending] = useActionState<AdminProfileActionState, FormData>(updateAdminProfileAction, {})

  const pwForm = useForm<PwF>({ resolver: zodResolver(pwSchema) })

  const onPwSubmit = (vals: PwF) => {
    const fd = new FormData()
    fd.set("oldPassword", vals.oldPassword)
    fd.set("newPassword", vals.newPassword)
    pwAction(fd)
  }

  const avatar = (profile?.name ?? "ا")[0]

  return (
    <div className="mx-auto w-full max-w-xl p-4 sm:p-6 space-y-5">

      {/* Avatar card */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm text-center">
        <span className="grid size-20 mx-auto place-items-center rounded-3xl bg-gradient-to-br from-rose-500 to-rose-600 text-3xl font-extrabold text-white shadow-lg">
          {avatar}
        </span>
        <p className="mt-3 text-base font-bold">{profile?.name ?? "مدير النظام"}</p>
        <p className="text-sm text-muted-foreground">{profile?.email}</p>
        <span className="mt-2 inline-block rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
          مدير النظام
        </span>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-2xl border border-border/60 bg-muted/40 p-1">
        {(["info", "password"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-medium transition-all",
              tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {t === "info" ? <><User className="size-3.5"/>بيانات الحساب</> : <><KeyRound className="size-3.5"/>كلمة المرور</>}
          </button>
        ))}
      </div>

      {/* ── Info tab ── */}
      {tab === "info" && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Pencil className="size-3.5 text-muted-foreground"/>تعديل البيانات
          </h2>

          {infoState.success ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="mb-2 size-10 text-emerald-500"/>
              <p className="font-semibold">تم حفظ التغييرات!</p>
            </div>
          ) : (
            <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-4" noValidate>
              {infoState.error && <p className="text-xs text-destructive">{infoState.error}</p>}

              <div className="space-y-1.5">
                <Label htmlFor="admin-name">الاسم</Label>
                <Controller name="name" control={infoForm.control} render={({ field }) => (
                  <Input {...field} id="admin-name" error={!!infoForm.formState.errors.name}/>
                )}/>
                {infoForm.formState.errors.name && (
                  <p className="text-xs text-destructive">{infoForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="admin-phone">رقم الهاتف</Label>
                <Controller name="phone" control={infoForm.control} render={({ field }) => (
                  <Input {...field} id="admin-phone" type="tel"/>
                )}/>
              </div>

              <Button type="submit" disabled={infoPending}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90">
                {infoPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* ── Password tab ── */}
      {tab === "password" && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <KeyRound className="size-3.5 text-muted-foreground"/>تغيير كلمة المرور
          </h2>

          {pwState.success ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckCircle2 className="mb-2 size-10 text-emerald-500"/>
              <p className="font-semibold">تم تغيير كلمة المرور!</p>
            </div>
          ) : (
            <form onSubmit={pwForm.handleSubmit(onPwSubmit)} className="space-y-4" noValidate>
              {pwState.error && <p className="text-xs text-destructive">{pwState.error}</p>}

              <div className="space-y-1.5">
                <Label htmlFor="old-pw">كلمة المرور الحالية</Label>
                <Controller name="oldPassword" control={pwForm.control} render={({ field }) => (
                  <Input {...field} id="old-pw" type="password" error={!!pwForm.formState.errors.oldPassword}/>
                )}/>
                {pwForm.formState.errors.oldPassword && (
                  <p className="text-xs text-destructive">{pwForm.formState.errors.oldPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pw">كلمة المرور الجديدة</Label>
                <Controller name="newPassword" control={pwForm.control} render={({ field }) => (
                  <Input {...field} id="new-pw" type="password" error={!!pwForm.formState.errors.newPassword}/>
                )}/>
                {pwForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">{pwForm.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pw">تأكيد كلمة المرور</Label>
                <Controller name="confirmPw" control={pwForm.control} render={({ field }) => (
                  <Input {...field} id="confirm-pw" type="password" error={!!pwForm.formState.errors.confirmPw}/>
                )}/>
                {pwForm.formState.errors.confirmPw && (
                  <p className="text-xs text-destructive">{pwForm.formState.errors.confirmPw.message}</p>
                )}
              </div>

              <Button type="submit" disabled={pwPending}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-90">
                {pwPending ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Logout — bust the client token cache before the Server Action redirects */}
      <form action={logoutAction} onSubmit={() => clearTokenCache()}>
        <Button type="submit" variant="outline"
          className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20">
          <LogOut className="size-4"/>تسجيل الخروج
        </Button>
      </form>
    </div>
  )
}