"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

type Role = "teacher" | "student"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [role, setRole] = useState<Role>("teacher")

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* ── Animated background ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -end-32 size-[500px] rounded-full bg-cyan-500/12 blur-[120px] animate-pulse-slow" />
        <div
          className="absolute top-1/2 -start-32 size-[400px] rounded-full bg-violet-500/10 blur-[100px] animate-pulse-slow"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          className="absolute -bottom-20 end-1/4 size-[300px] rounded-full bg-emerald-500/08 blur-[80px] animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        />

        <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-reg" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-reg)" />
        </svg>

        {[
          { size: "size-16", pos: "top-[10%] end-[8%]",    color: "bg-cyan-400/20",    delay: "0s" },
          { size: "size-9",  pos: "top-[30%] start-[10%]", color: "bg-violet-400/25",  delay: "2s" },
          { size: "size-11", pos: "bottom-[22%] end-[12%]", color: "bg-amber-400/18",  delay: "3s" },
          { size: "size-7",  pos: "bottom-[40%] start-[8%]", color: "bg-emerald-400/22", delay: "1s" },
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

      <div className="flex min-h-screen">
        {/* ── Left: Register form ── */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:max-w-[520px] lg:px-12 xl:px-16">
          <div className="w-full max-w-sm animate-slide-up">
            {/* Mobile logo */}
            <div className="mb-7 flex flex-col items-center lg:hidden">
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
                إنشاء حساب جديد
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                مجاني تماماً — ابدأ الآن وطوّر لاحقاً.
              </p>
            </div>

            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => e.preventDefault()}
              noValidate
            >
              {/* Role selector */}
              <div className="space-y-1.5">
                <Label>أنا…</Label>
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-input bg-muted/40 p-1.5">
                  {(
                    [
                      { value: "teacher", label: "مدرس", icon: BookOpen },
                      { value: "student", label: "طالب", icon: GraduationCap },
                    ] as { value: Role; label: string; icon: React.ElementType }[]
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRole(value)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        role === value
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <Label htmlFor="fullname">الاسم الكامل</Label>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="محمد أحمد"
                  autoComplete="name"
                  startIcon={<User />}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-email">البريد الإلكتروني</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  startIcon={<Mail />}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-password">كلمة المرور</Label>
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="٨ أحرف على الأقل"
                  autoComplete="new-password"
                  startIcon={<Lock />}
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
                  required
                />
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm">تأكيد كلمة المرور</Label>
                <Input
                  id="reg-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="أعد كتابة كلمة المرور"
                  autoComplete="new-password"
                  startIcon={<Lock />}
                  endIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? "إخفاء" : "إظهار"}
                      className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff /> : <Eye />}
                    </button>
                  }
                  required
                />
              </div>

              {/* Terms */}
              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 rounded border-input accent-primary"
                  required
                />
                <span className="text-muted-foreground leading-snug">
                  أوافق على{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    شروط الاستخدام
                  </a>{" "}
                  و{" "}
                  <a href="#" className="text-primary hover:underline font-medium">
                    سياسة الخصوصية
                  </a>
                </span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:opacity-90 transition-all"
              >
                إنشاء الحساب مجاناً
              </Button>

              {/* Divider */}
              <div className="relative flex items-center gap-3">
                <div className="flex-1 border-t border-border" />
                <span className="shrink-0 text-xs text-muted-foreground">أو</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Google signup */}
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full gap-3"
              >
                <GoogleIcon />
                التسجيل بـ Google
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
                className="font-semibold text-primary hover:underline"
              >
                سجّل الدخول
              </Link>
            </p>
          </div>
        </main>

        {/* ── Right decorative panel — hidden on mobile ── */}
        <aside className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-violet-600 to-indigo-800" />
          <div className="absolute inset-0 bg-gradient-animated opacity-70" />
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -end-20 size-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -start-20 size-96 rounded-full bg-violet-400/20 blur-3xl" />
          </div>

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
              انضم لمجتمع المدرسين
            </div>
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              ابدأ رحلتك
              <br />
              التعليمية اليوم
            </h2>
            <p className="mt-4 text-lg text-violet-100 leading-relaxed">
              أنشئ مجموعتك الأولى في أقل من دقيقة وابدأ في تتبع حضور طلابك.
            </p>

            {/* Benefits */}
            <ul className="mt-10 space-y-3">
              {[
                "إنشاء مجموعة في أقل من دقيقة",
                "تسجيل الحضور بضغطة واحدة",
                "لوحة ترتيب تحفّز الطلاب",
                "تقارير وإحصائيات مفصّلة",
                "مجاني للأبد للأفراد",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-cyan-300" />
                  <span className="text-sm text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Floating testimonial card */}
          <div className="relative z-10">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm ring-1 ring-white/20">
              <div className="flex gap-0.5 text-amber-300 mb-2">
                {Array.from({ length: 5 }).map((_, i) => <span key={i}>★</span>)}
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                &ldquo;وفّر عليّ ساعتين يومياً في تسجيل الحضور. أنصح به كل مدرس.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-sm font-bold text-white">
                  م
                </span>
                <div>
                  <p className="text-xs font-bold text-white">أ. محمد السيد</p>
                  <p className="text-[10px] text-violet-200">مدرس رياضيات</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-violet-300">
              © ٢٠٢٦ EduTrack — جميع الحقوق محفوظة
            </p>
          </div>
        </aside>
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
