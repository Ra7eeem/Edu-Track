"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { loginAction } from "@/features/auth/actions/login.action"
import { loginSchema, LoginFormValues } from "@/features/auth/schemas/login.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useActionState, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useActionState(loginAction, {})
  const [isPending, startTransition] = useTransition()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = (values: LoginFormValues) => {
    const fd = new FormData()
    fd.set("email",    values.email)
    fd.set("password", values.password)
    startTransition(() => formAction(fd))
  }

  const fieldErr = (field: keyof LoginFormValues) =>
    errors[field]?.message ?? state.fieldErrors?.[field]?.[0]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      {/* Global error */}
      {state.error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email">البريد الإلكتروني</Label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              startIcon={<Mail />}
              error={!!fieldErr("email")}
            />
          )}
        />
        {fieldErr("email") && (
          <p className="text-xs text-destructive">{fieldErr("email")}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">كلمة المرور</Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              startIcon={<Lock />}
              error={!!fieldErr("password")}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "إخفاء" : "إظهار"}
                  className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              }
            />
          )}
        />
        {fieldErr("password") && (
          <p className="text-xs text-destructive">{fieldErr("password")}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  )
}
