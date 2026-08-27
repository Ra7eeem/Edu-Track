"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/tailwind-cn"
import { Eye, EyeOff, GraduationCap, Lock, Mail, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* ── Animated background ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {/* gradient blobs */}
        <div className="absolute -top-32 -start-32 size-[500px] rounded-full bg-violet-500/15 blur-[120px] animate-pulse-slow" />
        <div
          className="absolute top-1/2 -end-32 size-[400px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute -bottom-20 start-1/4 size-[300px] rounded-full bg-amber-500/08 blur-[80px] animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />

        {/* grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-login" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>

        {/* floating orbs */}
        {[
          { size: "size-14", pos: "top-[12%] start-[8%]", color: "bg-violet-400/20", delay: "0s" },
          { size: "size-8",  pos: "top-[25%] end-[10%]",  color: "bg-cyan-400/25",   delay: "1.5s" },
          { size: "size-10", pos: "bottom-[20%] start-[12%]", color: "bg-amber-400/20", delay: "2.5s" },
          { size: "size-6",  pos: "bottom-[35%] end-[15%]",   color: "bg-emerald-400/25", delay: "0.8s" },
          { size: "size-12", pos: "top-[55%] start-[5%]",  color: "bg-violet-300/15", delay: "3.5s" },
        ].map((o, i) => (
          <span
            key={i}
            className={cn(
              "absolute rounded-full",
              o.size, o.pos, o.color,
              "animate-float"
            )}
            style={{ animationDelay: o.delay }}
          />
        ))}
      </div>

      {/* ── Layout ── */}
      <div className="flex min-h-screen">
        {/* Left decorative panel — hidden on mobile */}
        <aside className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          {/* full gradient bg */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-900" />
          <div className="absolute inset-0 bg-gradient-animated opacity-60" />
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -start-20 size-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -end-20 size-96 rounded-full bg-cyan-400/20 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                <GraduationCap className="size-6 text-white" />
              </span>
              <span className="text-xl font-bold text-white">EduTrack</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-sm">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white/90 backdrop-blur-sm">
              <Sparkles className="size-4 text-amber-300" />
              منصة إدارة المجموعات التعليمية
            </div>
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              مرحباً بعودتك
              <br />
              أستاذنا الكريم
            </h2>
            <p className="mt-4 text-lg text-violet-200 leading-relaxed">
              سجّل الدخول للوصول إلى مجموعاتك وطلابك ومتابعة تقدمهم.
            </p>

            {/* Floating stat cards */}
            <div className="mt-10 space-y-3">
              {[
                { icon: "👨‍🎓", label: "+٥٠٠٠ مدرس نشط يومياً" },
                { icon: "⚡", label: "تسجيل الحضور في ثوانٍ" },
                { icon: "🏆", label: "نظام نقاط يحفز الطلاب" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm ring-1 ring-white/10"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm text-white/90">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-xs text-violet-300">
            © ٢٠٢٦ EduTrack — جميع الحقوق محفوظة
          </div>
        </aside>

        {/* ── Right: Login form ── */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:max-w-[480px] lg:px-12">
          <div className="w-full max-w-sm animate-slide-up">
            {/* Mobile logo */}
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/30">
                  <GraduationCap className="size-5" />
                </span>
                <span className="text-lg font-bold">
                  <span className="text-gradient">Edu</span>Track
                </span>
              </Link>
            </div>

            <div className="text-center lg:text-start">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                تسجيل الدخول
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                أهلاً بك مجدداً! أدخل بياناتك للمتابعة.
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={(e) => e.preventDefault()}
              noValidate
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  startIcon={<Mail />}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  startIcon={<Lock />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                  required
                />
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="size-4 rounded border-input accent-primary"
                  defaultChecked
                />
                <span className="text-muted-foreground">تذكرني</span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:opacity-90 transition-all"
              >
                تسجيل الدخول
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="shrink-0 text-xs text-muted-foreground">أو</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Social login */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-3"
              >
                <GoogleIcon />
                تسجيل الدخول بـ Google
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-semibold text-primary hover:underline"
              >
                أنشئ حساباً مجاناً
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
