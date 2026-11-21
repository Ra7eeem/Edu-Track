import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Mihrab, LandingStarPattern } from "@/shared/components/star-pattern"
import { getSessionData } from "@/shared/lib/session"
import { Role } from "@/shared/types/api"
import Link from "next/link"
import { redirect } from "next/navigation"

/* ─── Feature Cards Data ─────────────────────────────────────────────────── */
const features = [
  {
    title: "مجموعات منظّمة",
    desc:  "أنشئ مجموعة لكل صف، أضف الطلاب، وتابع كل شيء من لوحة واحدة.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-14 text-accent">
        <circle cx="28" cy="18" r="7" />
        <circle cx="12" cy="24" r="5" />
        <circle cx="44" cy="24" r="5" />
        <path d="M14 46c0-8 6-13 14-13s14 5 14 13M3 42c0-5 4-8 9-8M53 42c0-5-4-8-9-8" />
      </svg>
    ),
  },
  {
    title: "حضور في ثوانٍ",
    desc:  "سجّل حضور جميع الطلاب بضغطة واحدة مع إحصائيات دقيقة وفورية.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-14 text-accent">
        <rect x="8" y="10" width="40" height="38" rx="2" />
        <path d="M8 20h40M18 6v8M38 6v8M18 33l6 6 14-13" />
      </svg>
    ),
  },
  {
    title: "تفاعل حقيقي",
    desc:  "منشورات وتعليقات وردود بين المدرس وطلابه داخل بيئة آمنة ومهذّبة.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-14 text-accent">
        <path d="M8 10h40v28H26l-10 9v-9H8z" />
        <path d="M18 20h20M18 28h12" />
      </svg>
    ),
  },
  {
    title: "ترتيب ونقاط",
    desc:  "نقاط تلقائية على الحضور والمشاركة مع لوحة ترتيب تحفّز على التميّز.",
    icon: (
      <svg viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="size-14 text-accent">
        <path d="M28 5l5 11 11-5-5 11 11 5-11 5 5 11-11-5-5 11-5-11-11 5 5-11-11-5 11-5-5-11 11 5z" strokeLinejoin="round" />
        <circle cx="28" cy="28" r="6" />
      </svg>
    ),
  },
]

/* ─── How it works steps ─────────────────────────────────────────────────── */
const steps = [
  {
    n:     "١",
    title: "أنشئ مجموعتك",
    desc:  "سجّل وأنشئ مجموعتك الأولى خلال دقيقة واحدة.",
  },
  {
    n:     "٢",
    title: "أضِف طلابك",
    desc:  "الطلاب يسجّلون بأنفسهم ويختارون مجموعتهم مباشرة.",
  },
  {
    n:     "٣",
    title: "ابدأ الحصة",
    desc:  "سجّل الحضور، انشر الدرس، وشاهد الطلاب يتنافسون على الترتيب.",
  },
]

/* ─── Stats Data ─────────────────────────────────────────────────────────── */
const stats = [
  { value: "+٥٠٠٠",  label: "مدرّس نشط" },
  { value: "+٨٠٠٠٠", label: "طالب مسجَّل" },
  { value: "٨٨٪",    label: "متوسط الحضور" },
]

export default async function HomePage() {
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* ══ TOP HEADER ══════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 h-[72px] flex items-center gap-6 sm:gap-8">
          <Link href="/" className="font-display font-bold text-3xl sm:text-4xl text-heading">
            معراج
          </Link>

          <nav aria-label="أقسام الموقع" className="hidden md:flex items-center gap-7 me-auto text-muted-foreground text-base">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#how" className="hover:text-foreground transition-colors">كيف يعمل</a>
            <a href="#join" className="hover:text-foreground transition-colors">انضم إلينا</a>
          </nav>

          <div className="flex items-center gap-3.5 ms-auto md:ms-0">
            <ThemeToggle showLabel={false} />
            <Link
              href="/login"
              className="text-foreground hover:text-accent font-semibold px-2 py-1 transition-colors"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="btn-mearaj text-base !h-10 !px-5"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ══ HERO SECTION ═══════════════════════════════════════════════ */}
        <section className="py-14 sm:py-20">
          <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 sm:gap-14 items-center">
            {/* Text column */}
            <div className="animate-slide-up">
              <p className="font-display text-xl sm:text-2xl text-accent mb-2.5">
                بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
              </p>
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight text-heading">
                ارتقِ بتجربة تدريسك
              </h1>
              <p className="text-lg sm:text-xl max-w-xl my-6 text-foreground/90 leading-relaxed">
                إدارة المجموعات والحضور والتفاعل بين المدرس وطلابه في مكانٍ واحد، برُوحٍ عربية وقيمٍ أصيلة.
              </p>

              <div className="flex flex-wrap gap-3.5 items-center">
                <Link href="/login" className="btn-mearaj">
                  ابدأ رحلتك
                </Link>
                <Link href="/register" className="btn-mearaj-outline">
                  سجّل كطالب
                </Link>
              </div>

              {/* Facts / Trust signals */}
              <div className="flex flex-wrap items-center mt-9 pt-4 border-t border-border text-muted-foreground text-sm sm:text-base">
                <span className="pe-4.5">مجاني تماماً</span>
                <span className="px-4.5 border-s border-border">بدون بطاقة ائتمان</span>
                <span className="px-4.5 border-s border-border">آمن ومشفَّر</span>
              </div>
            </div>

            {/* Architectural Mihrab */}
            <div className="animate-slide-up">
              <Mihrab caption="وَقُل رَّبِّ زِدْنِي عِلْمًا" />
            </div>
          </div>
        </section>

        {/* ══ FEATURES SECTION ═══════════════════════════════════════════ */}
        <section id="features" className="py-20 border-t border-border">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 mb-11 items-end">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-heading">
                كل ما يحتاجه المدرس الناجح
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                أدوات مصمّمة بعناية للمدرّس العربي لإدارة التدريس وتعميق الأثر.
              </p>
            </div>

            {/* 2x2 Ruled Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 border-t-2 border-primary">
              {features.map((feat, idx) => {
                const isOdd = idx % 2 === 0
                return (
                  <article
                    key={feat.title}
                    className={`grid grid-cols-[64px_1fr] gap-5 py-8 border-b border-border ${
                      isOdd ? "md:pe-9 md:border-e border-border" : "md:ps-9"
                    }`}
                  >
                    <div>{feat.icon}</div>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-foreground">
                        {feat.title}
                      </h3>
                      <p className="mt-1 text-muted-foreground leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS SECTION ═══════════════════════════════════════ */}
        <section id="how" className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
          {/* Subtle star pattern background */}
          <div className="opacity-30">
            <LandingStarPattern />
          </div>

          <div className="relative max-w-[1100px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 mb-12 items-end">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--goldOnG,#E3B84F)]">
                ابدأ في ثلاث خطوات
              </h2>
              <p className="text-primary-foreground/90 text-lg max-w-md">
                من التسجيل إلى أول حصة في دقائق معدودة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 bg-primary border-2 border-[var(--goldOnG,#E3B84F)]">
              {steps.map((st, i) => (
                <div
                  key={st.title}
                  className={`p-8 sm:p-9 ${
                    i > 0 ? "border-t md:border-t-0 md:border-s border-[var(--goldOnG,#E3B84F)]/40" : ""
                  }`}
                >
                  <div className="font-display text-6xl sm:text-7xl font-bold leading-none text-[var(--goldOnG,#E3B84F)]">
                    {st.n}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold mt-3 mb-2 text-primary-foreground">
                    {st.title}
                  </h3>
                  <p className="text-primary-foreground/90 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ STATS SECTION ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 border-t border-border">
          <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3">
            {stats.map((st, i) => (
              <div
                key={st.label}
                className={`py-4 px-6 ${
                  i === 0 ? "ps-0" : "border-t md:border-t-0 md:border-s border-border"
                }`}
              >
                <b className="block font-display text-5xl sm:text-6xl font-bold leading-tight text-heading">
                  {st.value}
                </b>
                <span className="text-muted-foreground text-lg">{st.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ CALL TO ACTION (FRAME) ═════════════════════════════════════ */}
        <section id="join" className="py-20 bg-card border-t border-border text-center">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="frame-double py-16 px-6 sm:px-12 bg-background">
              <q className="block font-display text-2xl sm:text-4xl text-accent mb-7 not-italic font-bold">
                ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
              </q>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-heading">
                جاهز للارتقاء؟
              </h2>
              <p className="mt-3 mb-8 text-muted-foreground text-lg max-w-lg mx-auto">
                انضم لآلاف المدرسين الذين وثقوا بمنصة معراج لإدارة مجموعاتهم التعليمية.
              </p>
              <div className="flex flex-wrap gap-4 justify-center items-center">
                <Link href="/register" className="btn-mearaj">
                  ابدأ الآن مجاناً
                </Link>
                <Link href="/register" className="btn-mearaj-outline">
                  انضم كطالب
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
      <footer className="py-8 border-t border-border text-muted-foreground text-sm">
        <div className="max-w-[1100px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© ١٤٤٦ هـ | معراج — منصة التعليم العربية</span>
          <nav aria-label="روابط سفلية" className="flex gap-6">
            <a href="#join" className="hover:text-foreground transition-colors">الخصوصية</a>
            <a href="#join" className="hover:text-foreground transition-colors">الشروط</a>
            <a href="#join" className="hover:text-foreground transition-colors">التواصل</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
