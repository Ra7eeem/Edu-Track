import { ThemeToggle } from "@/shared/components/theme-toggle"
import Image           from "next/image"
import Link            from "next/link"
import {
  ArrowLeft, BadgeCheck, CalendarCheck,
  MessagesSquare, ShieldCheck, Sparkles, Star, Trophy, Users,
} from "lucide-react"
import type React from "react"

/* ─── Feature + step data ───────────────────────────────────────────────── */
const features = [
  { Icon: Users,         title: "مجموعات منظّمة", text: "أنشئ مجموعة لكل صف، أضف الطلاب، وتابع كل شيء من لوحة واحدة." },
  { Icon: CalendarCheck, title: "حضور في ثوانٍ",   text: "سجّل حضور جميع الطلاب بضغطة واحدة مع إحصائيات دقيقة وفورية." },
  { Icon: MessagesSquare,title: "تفاعل حقيقي",     text: "منشورات وتعليقات وردود بين المدرس وطلابه داخل بيئة آمنة ومهذّبة." },
  { Icon: Trophy,        title: "ترتيب ونقاط",      text: "نقاط تلقائية على الحضور والمشاركة مع لوحة ترتيب تحفّز على التميّز." },
]

const steps = [
  { n: "١", title: "أنشئ مجموعتك", text: "سجّل وأنشئ مجموعتك الأولى خلال دقيقة واحدة." },
  { n: "٢", title: "أضِف طلابك",   text: "الطلاب يسجّلون بأنفسهم ويختارون مجموعتهم مباشرة." },
  { n: "٣", title: "ابدأ الحصة",   text: "سجّل الحضور، انشر الدرس، وشاهد الطلاب يتنافسون على الترتيب." },
]

const stats = [
  { value: "+٥٠٠٠",  label: "مدرّس نشط"     },
  { value: "+٨٠٠٠٠", label: "طالب مسجَّل"   },
  { value: "٨٨٪",    label: "متوسط الحضور" },
]

/* ─── Ornament ───────────────────────────────────────────────────────────── */
function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden>
      <span
        className="h-px w-16 sm:w-28"
        style={{ background: "linear-gradient(to left, transparent, var(--gold))", opacity: 0.7 }}
      />
      <Star className="size-4 animate-shimmer-star" style={{ color: "var(--gold)" }} />
      <span
        className="h-px w-16 sm:w-28"
        style={{ background: "linear-gradient(to right, transparent, var(--gold))", opacity: 0.7 }}
      />
    </div>
  )
}

/* ─── Gold CTA button ────────────────────────────────────────────────────── */
function GoldButton({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full px-7 py-3 font-display text-base font-semibold shadow-gold transition-transform hover:-translate-y-0.5 bg-gold-gradient"
      style={{ color: "var(--primary-foreground)" }}
    >
      {children}
      <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
    </Link>
  )
}

/* ─── Ghost button ───────────────────────────────────────────────────────── */
function GhostButton({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full px-7 py-3 font-display text-base font-semibold backdrop-blur transition-colors"
      style={{
        border:  "1.5px solid color-mix(in srgb, var(--gold) 40%, transparent)",
        background: "color-mix(in srgb, var(--card) 40%, transparent)",
        color: "var(--gold-soft)",
      }}
    >
      {children}
    </Link>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    /* bg-night uses --gradient-night which adapts light/dark via CSS vars */
    <div className="min-h-screen bg-night font-sans text-foreground">

      {/* ══ NAV ══════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-30 backdrop-blur-xl"
        style={{
          borderBottom: "1px solid color-mix(in srgb, var(--gold) 15%, transparent)",
          background:   "color-mix(in srgb, var(--background) 80%, transparent)",
        }}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">

          {/* Logo mark */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="size-5" style={{ color: "var(--gold)" }} aria-hidden />
            <span className="font-display text-2xl font-bold text-gold-gradient">معراج</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            {["المميزات:#features", "كيف يعمل:#how", "انضم إلينا:#join"].map(s => {
              const [label, hash] = s.split(":")
              return (
                <a key={hash} href={hash}
                  className="transition-colors hover:text-foreground"
                  style={{ "--hover-c": "var(--gold-soft)" } as React.CSSProperties}
                >
                  {label}
                </a>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm text-foreground/80 transition-colors hover:text-foreground">
              دخول
            </Link>
            <Link
              href="/register"
              className="rounded-full px-5 py-2 font-display text-sm font-semibold shadow-gold bg-gold-gradient"
              style={{ color: "var(--primary-foreground)" }}
            >
              ابدأ مجاناً
            </Link>
          </div>
        </nav>
      </header>

      {/* ══ HERO ═════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">

        {/* Islamic pattern */}
        <Image
          src="/islamic-pattern.jpg"
          alt="" aria-hidden fill
          className="pointer-events-none object-cover"
          style={{ opacity: 0.06 }}
          priority
        />

        {/* Gold radial top-glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80"
          style={{
            background: "radial-gradient(60% 100% at 50% 0%, var(--gold) 0%, transparent 70%)",
            opacity: 0.1,
          }}
        />

        <div className="relative mx-auto max-w-4xl px-5 pb-24 pt-16 text-center sm:pt-24">

          {/* Logo card — floating */}
          <div
            className="animate-float-slow mx-auto w-full max-w-sm overflow-hidden rounded-3xl shadow-deep"
            style={{ border: "1px solid color-mix(in srgb, var(--gold) 25%, transparent)" }}
          >
            <Image
              src="/main-logo.svg"
              alt="شعار منصة معراج التعليمية"
              width={480} height={270}
              priority
              className="w-full object-contain"
            />
          </div>

          {/* Bismillah */}
          <p
            className="mt-10 font-quran text-xl sm:text-2xl"
            style={{ color: "color-mix(in srgb, var(--gold-soft) 80%, transparent)" }}
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Headline */}
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.25] sm:text-6xl">
            ارتقِ بتجربة{" "}
            <span className="text-gold-gradient">تدريسك</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            منصة{" "}
            <span className="font-semibold" style={{ color: "var(--gold-soft)" }}>معراج</span>
            {" "}— إدارة المجموعات والحضور والتفاعل بين المدرس وطلابه في مكانٍ واحد، برُوحٍ عربية وقيمٍ أصيلة.
          </p>

          {/* Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <GoldButton href="/login">ابدأ رحلتك</GoldButton>
            <GhostButton href="/register">سجّل كطالب</GhostButton>
          </div>

          {/* Trust signals */}
          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
            {[
              { Icon: BadgeCheck, text: "مجاني تماماً"       },
              { Icon: BadgeCheck, text: "بدون بطاقة ائتمان" },
              { Icon: ShieldCheck,text: "آمن ومشفَّر"        },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-2">
                <Icon className="size-4" style={{ color: "var(--emerald)" }} />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ FEATURES ═════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="py-20 sm:py-28"
        style={{ borderTop: "1px solid color-mix(in srgb, var(--gold) 10%, transparent)" }}
      >
        <div className="mx-auto max-w-6xl px-5">
          <Ornament />

          <h2 className="mt-6 text-center font-display text-3xl font-bold sm:text-4xl">
            كل ما يحتاجه المدرس الناجح
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            أدوات مصمّمة بعناية للمدرّس العربي.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {features.map(({ Icon, title, text }) => (
              <article
                key={title}
                className="feature-card group relative overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "color-mix(in srgb, var(--card) 60%, transparent)",
                  border:     "1px solid color-mix(in srgb, var(--gold) 15%, transparent)",
                }}
              >
                {/* Shimmer line top */}
                <span
                  aria-hidden
                  className="absolute inset-x-8 top-0 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, var(--gold) 45%, var(--gold) 55%, transparent)",
                    opacity: 0.55,
                  }}
                />
                {/* Icon */}
                <span
                  className="inline-flex size-12 items-center justify-center rounded-2xl"
                  style={{
                    border:     "1px solid color-mix(in srgb, var(--gold) 25%, transparent)",
                    background: "color-mix(in srgb, var(--secondary) 100%, var(--navy-deep) 0%)",
                    color:      "var(--gold)",
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
      <section id="how" className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Ornament />

          <h2 className="mt-6 text-center font-display text-3xl font-bold sm:text-4xl">
            ابدأ في ثلاث خطوات
          </h2>

          <ol className="mt-14 grid gap-10 md:grid-cols-3" dir="ltr">
            {steps.map(({ n, title, text }) => (
              <li key={n} className="text-center" dir="rtl">
                <span
                  className="mx-auto flex size-16 items-center justify-center rounded-2xl font-display text-2xl font-bold shadow-deep"
                  style={{
                    border:     "1px solid color-mix(in srgb, var(--gold) 30%, transparent)",
                    background: "color-mix(in srgb, var(--card) 70%, transparent)",
                    color:      "var(--gold)",
                  }}
                >
                  {n}
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </li>
            ))}
          </ol>

          {/* Stats */}
          <div
            className="mt-16 grid gap-8 rounded-3xl px-6 py-10 text-center sm:grid-cols-3"
            style={{
              border:     "1px solid color-mix(in srgb, var(--gold) 15%, transparent)",
              background: "color-mix(in srgb, var(--card) 50%, transparent)",
            }}
          >
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="font-display text-3xl font-bold text-gold-gradient sm:text-4xl">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════ */}
      <section id="join" className="px-5 pb-24">
        <div
          className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] p-10 text-center shadow-deep sm:p-16 dark"
          style={{
            border:     "1px solid color-mix(in srgb, var(--gold) 25%, transparent)",
            background: "var(--navy-deep)",
          }}
        >
          {/* Pattern */}
          <Image
            src="/islamic-pattern.jpg"
            alt="" aria-hidden fill
            className="pointer-events-none object-cover"
            style={{ opacity: 0.18 }}
          />

          <div className="relative">
            <Sparkles
              aria-hidden
              className="mx-auto size-7 animate-shimmer-star"
              style={{ color: "var(--gold)" }}
            />

            <h2 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              جاهز{" "}
              <span className="text-gold-gradient">للارتقاء</span>؟
            </h2>
            <p className="mt-3 text-muted-foreground">
              انضم لآلاف المدرسين الذين وثقوا بمنصة{" "}
              <span className="font-semibold" style={{ color: "var(--gold-soft)" }}>معراج</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <GoldButton href="/login">ابدأ الآن مجاناً</GoldButton>
              <GhostButton href="/register">انضم كطالب</GhostButton>
            </div>

            <p
              className="mt-6 font-quran text-base"
              style={{ color: "color-mix(in srgb, var(--gold-soft) 70%, transparent)" }}
            >
              ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
            </p>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer
        className="py-8"
        style={{
          borderTop:   "1px solid color-mix(in srgb, var(--gold) 15%, transparent)",
          background:  "color-mix(in srgb, var(--secondary) 50%, transparent)",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>© ١٤٤٦ هـ | معراج — منصة التعليم العربية</p>
          <div className="flex items-center gap-6">
            {["الخصوصية", "الشروط", "التواصل"].map(l => (
              <a key={l} href="#join" className="transition-colors hover:text-foreground">{l}</a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  )
}
