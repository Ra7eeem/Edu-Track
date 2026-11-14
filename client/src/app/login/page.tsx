import { LoginForm } from "@/features/auth/components/login-form"
import Image          from "next/image"
import Link           from "next/link"
import { Sparkles, Star } from "lucide-react"

/* ─── fixed navy palette (same in light + dark) ─────────────────────────── */
const NAVY      = "oklch(0.19 0.05 261)"
const NAVY_DARK = "oklch(0.14 0.04 260)"
const GOLD_VAR  = "var(--gold)"
const GOLD_SOFT = "var(--gold-soft)"

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; callbackUrl?: string }>
}) {
  const params = await searchParams
  const callbackUrl = params?.callbackUrl ?? params?.from
  return (
    <div className="relative min-h-screen font-sans text-foreground" style={{ background: "var(--background)" }}>

      <div className="flex min-h-screen">

        {/* ══ Left panel — always navy regardless of light/dark ══════════ */}
        <aside
          className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-14"
          style={{ background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_DARK} 100%)` }}
        >
          {/* Islamic pattern overlay */}
          <Image
            src="/islamic-pattern.jpg"
            alt="" aria-hidden fill
            className="pointer-events-none object-cover"
            style={{ opacity: 0.15 }}
          />

          {/* Gold radial glow — top start */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -start-32 size-[500px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${GOLD_VAR}, transparent 65%)`,
              opacity: 0.12,
            }}
          />

          {/* Bottom-end glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -end-24 size-72 rounded-full"
            style={{
              background: `radial-gradient(circle, ${GOLD_VAR}, transparent 65%)`,
              opacity: 0.08,
            }}
          />

          {/* ── Logo ── */}
          <div className="relative z-10 flex items-center gap-2.5">
            <Sparkles className="size-5" style={{ color: GOLD_VAR }} />
            <span className="font-display text-2xl font-bold text-gold-gradient">معراج</span>
          </div>

          {/* ── Quote + heading ── */}
          <div className="relative z-10 max-w-sm">
            {/* Ornament rule */}
            <div className="mb-7 flex items-center gap-3">
              <span
                className="h-px w-14"
                style={{ background: `linear-gradient(to left, transparent, ${GOLD_VAR})`, opacity: 0.6 }}
              />
              <Star className="size-3.5 animate-shimmer-star" style={{ color: GOLD_VAR }} />
              <span
                className="h-px w-14"
                style={{ background: `linear-gradient(to right, transparent, ${GOLD_VAR})`, opacity: 0.6 }}
              />
            </div>

            <p
              className="mb-5 font-quran text-lg"
              style={{ color: `color-mix(in srgb, ${GOLD_SOFT} 70%, transparent)` }}
            >
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </p>

            <h2 className="font-display text-4xl font-bold leading-tight" style={{ color: "#fff" }}>
              مرحباً بعودتك
              <br />
              <span style={{ color: GOLD_VAR }}>أستاذنا الكريم</span>
            </h2>

            <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              سجّل الدخول للوصول إلى مجموعاتك وطلابك ومتابعة تقدمهم.
            </p>
          </div>

          <p className="relative z-10 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            © ١٤٤٦ هـ | معراج
          </p>
        </aside>

        {/* ══ Right panel — form ════════════════════════════════════════ */}
        <main
          className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:max-w-[480px] lg:px-14"
          style={{ background: "var(--background)" }}
        >
          <div className="w-full max-w-sm animate-slide-up">

            {/* Mobile logo (shown below lg) */}
            <div className="mb-8 flex flex-col items-center gap-3 lg:hidden">
              {/* Logo card to make it readable on light bg */}
              <div
                className="overflow-hidden rounded-2xl shadow-deep"
                style={{ background: NAVY, padding: "12px 20px" }}
              >
                <Image
                  src="/main-logo.svg"
                  alt="معراج"
                  width={180} height={101}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Form heading */}
            <div className="mb-6">
              <h1 className="font-display text-2xl font-bold sm:text-3xl">تسجيل الدخول</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">أهلاً بك! أدخل بياناتك للمتابعة.</p>
            </div>

            {/* Form card */}
            <div
              className="rounded-3xl p-7 shadow-deep"
              style={{
                background:   "var(--card)",
                border:       `1px solid color-mix(in srgb, ${GOLD_VAR} 22%, transparent)`,
              }}
            >
              <LoginForm callbackUrl={callbackUrl} />
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                className="font-semibold hover:underline"
                style={{ color: "var(--gold)" }}
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
