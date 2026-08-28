import { LoginForm } from "@/features/auth/components/login-form"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* bg blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -start-20 size-[500px] rounded-full bg-violet-500/15 blur-[100px] animate-pulse-slow" />
        <div className="absolute top-1/2 -end-20 size-[350px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="flex min-h-screen">
        {/* Left panel — desktop only */}
        <aside className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-900" />
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -start-20 size-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-20 -end-20 size-96 rounded-full bg-cyan-400/20 blur-3xl" />
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
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              مرحباً بعودتك
              <br />أستاذنا الكريم
            </h2>
            <p className="mt-4 text-lg text-violet-200 leading-relaxed">
              سجّل الدخول للوصول إلى مجموعاتك وطلابك ومتابعة تقدمهم.
            </p>
          </div>
          <p className="relative z-10 text-xs text-violet-300">© ٢٠٢٦ EduTrack</p>
        </aside>

        {/* Right: form */}
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:max-w-[480px] lg:px-12">
          <div className="w-full max-w-sm animate-slide-up">
            {/* Mobile logo */}
            <div className="mb-8 flex flex-col items-center lg:hidden">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
                  <GraduationCap className="size-5" />
                </span>
                <span className="text-lg font-bold"><span className="text-gradient">Edu</span>Track</span>
              </Link>
            </div>

            <div className="text-center lg:text-start">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">تسجيل الدخول</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">أهلاً بك! أدخل بياناتك للمتابعة.</p>
            </div>

            <LoginForm />

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                أنشئ حساباً مجاناً
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
