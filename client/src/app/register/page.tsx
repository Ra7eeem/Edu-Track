import { RegisterStudentForm } from "@/features/auth/components/register-student-form"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { getSessionData } from "@/shared/lib/session"
import { Role } from "@/shared/types/api"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function RegisterPage() {
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

  return (
    <div className="relative min-h-screen font-sans bg-background text-foreground flex flex-col">
      {/* Top minimal header with ThemeToggle */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <Link href="/" className="font-display font-bold text-2xl text-heading">
          معراج
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Header */}
          <div className="mb-6 text-center">
            <p className="font-display text-lg text-accent mb-1">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
            <h1 className="font-display text-3xl font-bold text-heading">إنشاء حساب طالب</h1>
            <p className="mt-1 text-sm text-muted-foreground">انضم لمجموعتك وابدأ رحلتك التعليمية</p>
          </div>

          {/* Form card */}
          <div className="rounded border border-border bg-card p-7 shadow-sm">
            <RegisterStudentForm />
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              سجّل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
