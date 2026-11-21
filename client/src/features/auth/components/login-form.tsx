"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { useLogin } from "@/features/auth/hooks/auth-login"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Controller } from "react-hook-form"

interface LoginFormProps {
  callbackUrl?: string
}

/**
 * LoginForm component
 * Uses React Hook Form + zodResolver + NextAuth signIn.
 * Follows Rose-App architecture.
 */
export function LoginForm({ callbackUrl }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { handleSubmit, control, errors, isSubmitting, onSubmit } = useLogin(callbackUrl)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      {/* Root/Server Error */}
      {errors.root && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors.root.message}
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
              error={!!errors.email}
            />
          )}
        />
        {errors.email?.message && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
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
              error={!!errors.password}
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
        {errors.password?.message && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
      >
        {isSubmitting ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  )
}
