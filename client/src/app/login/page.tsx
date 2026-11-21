import { LoginForm } from "@/features/auth/components/login-form"
import { LandingStarPattern } from "@/shared/components/star-pattern"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { getSessionData } from "@/shared/lib/session"
import { Role } from "@/shared/types/api"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; callbackUrl?: string }>
}) {
  const session = await getSessionData()
  if (session?.isLoggedIn && session.role) {
    const dest =
      session.role === Role.ADMIN
        ? "/admin/dashboard"
        : session.role === Role.TEACHER
        ? "/teacher/dashboard"
        : "/student/dashboard"
    redirect(dest)
  }

  const params = await searchParams
  const callbackUrl = params?.callbackUrl ?? params?.from

  return (
    <div className="relative min-h-screen font-sans bg-background text-foreground flex flex-col">
      {/* Top minimal header with ThemeToggle */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display font-bold text-2xl text-heading">
          معراج
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 min-h-screen">
        {/* ══ Left panel — Emerald Night / Architectural panel ══════════ */}
        <aside className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14 bg-primary text-primary-foreground">
          {/* Star pattern background */}
          <div className="opacity-25">
            <LandingStarPattern />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <Link href="/" className="font-display text-3xl font-bold text-[var(--goldOnG,#E3B84F)]">
              معراج
            </Link>
          </div>

          {/* Quote + heading */}
          <div className="relative z-10 max-w-md">
            <p className="mb-4 font-display text-xl text-[var(--goldOnG,#E3B84F)]">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>

            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-primary-foreground">
              مرحباً بعودتك
              <br />
              <span className="text-[var(--goldOnG,#E3B84F)]">أستاذنا الكريم</span>
            </h2>

            <p className="mt-4 text-base leading-relaxed text-primary-foreground/90">
              سجّل الدخول للوصول إلى مجموعاتك وطلابك ومتابعة تقدمهم برُوحٍ تعليمية راقية.
            </p>
          </div>

          <p className="relative z-10 text-xs text-primary-foreground/75">
            © ١٤٤٦ هـ | معراج — منصة التعليم العربية
          </p>
        </aside>

        {/* ══ Right panel — Login Form ═════════════════════════════════ */}
        <main className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8 lg:max-w-[480px] lg:px-14 bg-background">
          <div className="w-full max-w-sm animate-slide-up">
            {/* Form heading */}
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold text-heading">تسجيل الدخول</h1>
              <p className="mt-1 text-sm text-muted-foreground">أهلاً بك! أدخل بياناتك للمتابعة.</p>
            </div>

            {/* Form card */}
            <div className="rounded border border-border bg-card p-7 shadow-sm">
              <LoginForm callbackUrl={callbackUrl} />
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-semibold text-accent hover:underline"
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
