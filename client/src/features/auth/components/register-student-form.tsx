"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { registerStudentAction } from "@/features/auth/actions/register.action"
import { registerStudentSchema, RegisterStudentFormValues } from "@/features/auth/schemas/register.schema"
import { Grade, GRADE_LABELS } from "@/shared/types/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react"
import { useActionState, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

interface Group { id: string; name: string; grades?: string[] }
interface Props  { groups: Group[] }

export function RegisterStudentForm({ groups }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useActionState(registerStudentAction, {})
  const [isPending, startTransition] = useTransition()

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", grade: undefined, groupId: "" },
  })

  const selectedGrade = watch("grade")

  // Only show groups that target this grade (or have no grade restrictions)
  const filteredGroups = selectedGrade
    ? groups.filter(g =>
        !g.grades || g.grades.length === 0 || g.grades.includes(selectedGrade)
      )
    : []

  const onSubmit = (values: RegisterStudentFormValues) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => fd.set(k, v as string))
    startTransition(() => formAction(fd))
  }

  const fieldErr = (field: keyof RegisterStudentFormValues) =>
    errors[field]?.message ?? state.fieldErrors?.[field]?.[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {state.error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">الاسم الكامل</Label>
        <Controller name="name" control={control} render={({ field }) => (
          <Input {...field} id="name" placeholder="محمد أحمد" startIcon={<User />} error={!!fieldErr("name")} />
        )} />
        {fieldErr("name") && <p className="text-xs text-destructive">{fieldErr("name")}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="st-email">البريد الإلكتروني</Label>
        <Controller name="email" control={control} render={({ field }) => (
          <Input {...field} id="st-email" type="email" placeholder="you@example.com" startIcon={<Mail />} error={!!fieldErr("email")} />
        )} />
        {fieldErr("email") && <p className="text-xs text-destructive">{fieldErr("email")}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Controller name="phone" control={control} render={({ field }) => (
          <Input {...field} id="phone" type="tel" placeholder="01012345678" startIcon={<Phone />} error={!!fieldErr("phone")} />
        )} />
        {fieldErr("phone") && <p className="text-xs text-destructive">{fieldErr("phone")}</p>}
      </div>

      {/* Grade — must be chosen first */}
      <div className="space-y-1.5">
        <Label htmlFor="grade">الصف الدراسي</Label>
        <Controller name="grade" control={control} render={({ field }) => (
          <div className="relative">
            <select {...field} id="grade"
              className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all">
              <option value="">-- اختر صفك الدراسي أولاً --</option>
              {Object.entries(GRADE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )} />
        {fieldErr("grade") && <p className="text-xs text-destructive">{fieldErr("grade")}</p>}
      </div>

      {/* Group — only shown after grade is selected */}
      {selectedGrade ? (
        <div className="space-y-1.5">
          <Label htmlFor="groupId">اختر مجموعتك</Label>
          {filteredGroups.length === 0 ? (
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/30 dark:bg-amber-950/20 dark:text-amber-400">
              لا توجد مجموعات متاحة لهذا الصف حالياً
            </div>
          ) : (
            <Controller name="groupId" control={control} render={({ field }) => (
              <div className="relative">
                <select {...field} id="groupId"
                  className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all">
                  <option value="">-- اختر مجموعتك --</option>
                  {filteredGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            )} />
          )}
          {fieldErr("groupId") && <p className="text-xs text-destructive">{fieldErr("groupId")}</p>}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/40 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          اختر صفك الدراسي أولاً لتظهر المجموعات المتاحة لك
        </div>
      )}

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="st-password">كلمة المرور</Label>
        <Controller name="password" control={control} render={({ field }) => (
          <Input {...field} id="st-password" type={showPassword ? "text" : "password"}
            placeholder="٨ أحرف على الأقل" startIcon={<Lock />} error={!!fieldErr("password")}
            endIcon={
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
          />
        )} />
        {fieldErr("password") && <p className="text-xs text-destructive">{fieldErr("password")}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isPending}
        className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50">
        {isPending ? "جارٍ إنشاء الحساب..." : "إنشاء حساب طالب"}
      </Button>
    </form>
  )
}

export function RegisterStudentForm({ groups }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useActionState(registerStudentAction, {})
  const [isPending, startTransition] = useTransition()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterStudentFormValues>({
    resolver: zodResolver(registerStudentSchema),
    defaultValues: {
      name: "", email: "", password: "", phone: "",
      grade: undefined, groupId: "",
    },
  })

  const onSubmit = (values: RegisterStudentFormValues) => {
    const fd = new FormData()
    Object.entries(values).forEach(([k, v]) => fd.set(k, v as string))
    startTransition(() => formAction(fd))
  }

  const fieldErr = (field: keyof RegisterStudentFormValues) =>
    errors[field]?.message ?? state.fieldErrors?.[field]?.[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {state.error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">الاسم الكامل</Label>
        <Controller name="name" control={control} render={({ field }) => (
          <Input {...field} id="name" placeholder="محمد أحمد" startIcon={<User />} error={!!fieldErr("name")} />
        )} />
        {fieldErr("name") && <p className="text-xs text-destructive">{fieldErr("name")}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="st-email">البريد الإلكتروني</Label>
        <Controller name="email" control={control} render={({ field }) => (
          <Input {...field} id="st-email" type="email" placeholder="you@example.com" startIcon={<Mail />} error={!!fieldErr("email")} />
        )} />
        {fieldErr("email") && <p className="text-xs text-destructive">{fieldErr("email")}</p>}
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <Label htmlFor="phone">رقم الهاتف</Label>
        <Controller name="phone" control={control} render={({ field }) => (
          <Input {...field} id="phone" type="tel" placeholder="01012345678" startIcon={<Phone />} error={!!fieldErr("phone")} />
        )} />
        {fieldErr("phone") && <p className="text-xs text-destructive">{fieldErr("phone")}</p>}
      </div>

      {/* Grade */}
      <div className="space-y-1.5">
        <Label htmlFor="grade">الصف الدراسي</Label>
        <Controller name="grade" control={control} render={({ field }) => (
          <div className="relative">
            <select
              {...field}
              id="grade"
              className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            >
              <option value="">-- اختر صفك الدراسي --</option>
              {Object.entries(GRADE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )} />
        {fieldErr("grade") && <p className="text-xs text-destructive">{fieldErr("grade")}</p>}
      </div>

      {/* Group */}
      <div className="space-y-1.5">
        <Label htmlFor="groupId">اختر مجموعتك</Label>
        <Controller name="groupId" control={control} render={({ field }) => (
          <div className="relative">
            <select
              {...field}
              id="groupId"
              className="flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
            >
              <option value="">-- اختر مجموعتك --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}{g.subject ? ` — ${g.subject}` : ""}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )} />
        {fieldErr("groupId") && <p className="text-xs text-destructive">{fieldErr("groupId")}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="st-password">كلمة المرور</Label>
        <Controller name="password" control={control} render={({ field }) => (
          <Input
            {...field}
            id="st-password"
            type={showPassword ? "text" : "password"}
            placeholder="٨ أحرف على الأقل"
            startIcon={<Lock />}
            error={!!fieldErr("password")}
            endIcon={
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
          />
        )} />
        {fieldErr("password") && <p className="text-xs text-destructive">{fieldErr("password")}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isPending}
        className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50">
        {isPending ? "جارٍ إنشاء الحساب..." : "إنشاء حساب طالب"}
      </Button>
    </form>
  )
}
