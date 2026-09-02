import { RegisterStudentForm } from "@/features/auth/components/register-student-form"
import Image                   from "next/image"
import Link                    from "next/link"
import { Sparkles }            from "lucide-react"

const NAVY = "oklch(0.19 0.05 261)"

export default function RegisterPage() {
  return (
    <div
      className="relative min-h-screen font-sans text-foreground"
      style={{ background: "var(--background)" }}
    >
      {/* Subtle gold glow top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72"
        style={{
          background: "radial-gradient(60% 100% at 50% 0%, var(--gold) 0%, transparent 70%)",
          opacity: 0.06,
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md animate-slide-up">

          {/* Logo — always on navy pill so it reads on both light and dark */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div
              className="overflow-hidden rounded-2xl shadow-deep"
              style={{ background: NAVY, padding: "12px 24px" }}
            >
              <Image src="/main-logo.svg" alt="معراج" width={200} height={113} className="object-contain" />
            </div>

            {/* Bismillah */}
            <p
              className="font-quran text-base"
              style={{ color: "color-mix(in srgb, var(--gold-soft) 80%, transparent)" }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-3xl p-7 shadow-deep"
            style={{
              background: "var(--card)",
              border:     "1px solid color-mix(in srgb, var(--gold) 22%, transparent)",
            }}
          >
            {/* Top shimmer line */}
            <span
              aria-hidden
              className="absolute inset-x-10 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, var(--gold) 45%, var(--gold) 55%, transparent)",
                opacity: 0.45,
              }}
            />

            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4" style={{ color: "var(--gold)" }} />
              <h1 className="font-display text-xl font-bold">إنشاء حساب طالب</h1>
            </div>
            <p className="text-sm text-muted-foreground">انضم لمجموعتك وابدأ رحلتك التعليمية</p>

            <div className="mt-5">
              <RegisterStudentForm />
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            لديك حساب؟{" "}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: "var(--gold)" }}>
              سجّل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
