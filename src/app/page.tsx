import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  MessageCircle,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"

/* ─── Feature Cards ─── */
const features = [
  {
    icon: Users,
    title: "مجموعات منظّمة",
    body: "أنشئ مجموعة لكل صف، أضف الطلاب والمدرسين، وتابع كل شيء من لوحة واحدة.",
    color: "from-violet-500 to-violet-600",
    soft: "bg-violet-50 dark:bg-violet-900/20",
    text: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: CalendarCheck,
    title: "حضور في ثوانٍ",
    body: "سجّل الحضور بضغطة واحدة لكل طالب، مع سجل كامل وإحصائيات دقيقة.",
    color: "from-cyan-500 to-cyan-600",
    soft: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  {
    icon: MessageCircle,
    title: "تفاعل داخل المجموعة",
    body: "منشورات وإعلانات وتعليقات وردود بين المدرس وطلابه في مكان آمن.",
    color: "from-amber-500 to-amber-600",
    soft: "bg-amber-50 dark:bg-amber-900/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: Trophy,
    title: "ترتيب ونقاط",
    body: "نقاط تلقائية على الحضور والمشاركة مع لوحة ترتيب تحفّز الطلاب.",
    color: "from-emerald-500 to-emerald-600",
    soft: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Bell,
    title: "إشعارات فورية",
    body: "تنبيه الطلاب بكل منشور جديد أو رد أو تسجيل حضور.",
    color: "from-rose-500 to-rose-600",
    soft: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  {
    icon: BarChart3,
    title: "تقارير واضحة",
    body: "نِسَب الحضور والنمو الشهري في رسوم بيانية سهلة القراءة.",
    color: "from-violet-500 to-cyan-500",
    soft: "bg-primary-soft",
    text: "text-primary",
  },
]

/* ─── Pricing Plans ─── */
const plans = [
  {
    name: "مجاني",
    price: "٠",
    desc: "مثالي للمدرس المبتدئ",
    features: ["مجموعة واحدة", "حتى ٣٠ طالب", "تسجيل الحضور", "المنشورات الأساسية"],
    cta: "ابدأ مجاناً",
    href: "/register",
    highlighted: false,
  },
  {
    name: "برو",
    price: "٤٩",
    desc: "للمدرسين المحترفين",
    features: [
      "مجموعات غير محدودة",
      "طلاب غير محدودين",
      "تقارير متقدمة",
      "لوحة الترتيب",
      "إشعارات فورية",
      "دعم أولوية",
    ],
    cta: "جرّب ٣٠ يوماً مجاناً",
    href: "/register",
    highlighted: true,
  },
  {
    name: "مدرسة",
    price: "١٩٩",
    desc: "للمؤسسات التعليمية",
    features: [
      "كل ميزات برو",
      "لوحة إدارة المدرسة",
      "تقارير إدارية",
      "API مخصص",
      "مدير حساب مخصص",
    ],
    cta: "تواصل معنا",
    href: "/contact",
    highlighted: false,
  },
]

/* ─── Testimonials ─── */
const testimonials = [
  {
    name: "أ. محمد السيد",
    role: "مدرس رياضيات",
    body: "وفّر عليّ ساعتين يومياً في تسجيل الحضور والمتابعة. أنصح به كل مدرس.",
    avatar: "م",
    color: "from-violet-500 to-violet-600",
  },
  {
    name: "أ. فاطمة النور",
    role: "مدرسة لغة عربية",
    body: "الطلاب أصبحوا أكثر تفاعلاً بعد إضافة نظام النقاط. المنافسة الإيجابية رائعة!",
    avatar: "ف",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    name: "أ. خالد العمر",
    role: "مدير مدرسة",
    body: "نظام التقارير وفّر لنا رؤية شاملة على أداء كل طالب في جميع المواد.",
    avatar: "خ",
    color: "from-amber-500 to-amber-600",
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ══════════════════════ HEADER ══════════════════════ */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/30 transition-transform group-hover:scale-110">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-base font-bold">
              <span className="text-gradient">Edu</span>Track
            </span>
          </Link>

          {/* Nav links (hidden on mobile) */}
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">الأسعار</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">آراء المستخدمين</a>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" >
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/30 hover:shadow-violet-500/50 hover:opacity-90 transition-all"
              
            >
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ══════════════════════ HERO ══════════════════════ */}
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-32">
          {/* Background blobs */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute -top-40 -start-20 size-[500px] rounded-full bg-violet-500/20 blur-[100px] animate-pulse-slow" />
            <div
              className="absolute top-1/3 -end-20 size-[400px] rounded-full bg-cyan-500/15 blur-[80px] animate-pulse-slow"
              style={{ animationDelay: "2s" }}
            />
            <div
              className="absolute bottom-0 start-1/3 size-[300px] rounded-full bg-amber-500/10 blur-[70px] animate-pulse-slow"
              style={{ animationDelay: "4s" }}
            />
            {/* Grid lines */}
            <svg
              className="absolute inset-0 h-full w-full opacity-[0.04]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center animate-slide-up">
              <Badge
                variant="secondary"
                className="mb-5 gap-1.5 border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
              >
                <Sparkles className="size-3" />
                نسخة تجريبية ببيانات واقعية
              </Badge>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                إدارة مجموعاتك
                <br />
                <span className="text-gradient">بشكل أذكى</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                منصة عربية واحدة للمدرس والطالب: مجموعات، تسجيل حضور سريع،
                منشورات وتعليقات، ولوحة ترتيب تحفّز الطلاب على الاستمرار.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="group gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:opacity-90 transition-all"
                  
                >
                  <Link href="/register">
                    ابدأ مجاناً الآن
                    <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border/80" >
                  <Link href="#features">تعرف على المميزات</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                {["بدون بطاقة ائتمان", "مجاني للأبد للأفراد", "آمن ومشفر"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Hero visual — floating dashboard card */}
            <div className="relative mt-16 animate-slide-up-delay">
              {/* Main card */}
              <div className="relative mx-auto max-w-3xl rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-cyan-50/50 p-1 shadow-2xl shadow-violet-500/20 dark:border-violet-900/40 dark:from-violet-950/50 dark:to-cyan-950/30">
                <div className="rounded-[1.4rem] bg-card p-6 sm:p-8">
                  {/* Fake browser bar */}
                  <div className="mb-5 flex items-center gap-2">
                    <span className="size-3 rounded-full bg-rose-400" />
                    <span className="size-3 rounded-full bg-amber-400" />
                    <span className="size-3 rounded-full bg-emerald-400" />
                    <span className="mx-auto h-6 w-48 rounded-full bg-muted" />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { k: "112", v: "طالب نشط", color: "from-violet-500 to-violet-600" },
                      { k: "٨٦٪", v: "نسبة الحضور", color: "from-cyan-500 to-cyan-600" },
                      { k: "63", v: "منشور هذا الشهر", color: "from-amber-500 to-amber-600" },
                    ].map((s) => (
                      <div
                        key={s.v}
                        className="rounded-2xl bg-gradient-to-br p-px shadow-sm"
                        style={{ background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}
                      >
                        <div className={`rounded-2xl bg-gradient-to-br ${s.color} p-4 text-center text-white`}>
                          <p className="text-2xl font-bold sm:text-3xl">{s.k}</p>
                          <p className="mt-0.5 text-xs opacity-80">{s.v}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Fake attendance list */}
                  <div className="mt-4 space-y-2">
                    {[
                      { name: "أحمد محمد", status: "حاضر", dot: "bg-emerald-500" },
                      { name: "سارة إبراهيم", status: "حاضر", dot: "bg-emerald-500" },
                      { name: "عمر عبدالله", status: "غائب", dot: "bg-rose-400" },
                      { name: "نورا حسن", status: "متأخر", dot: "bg-amber-400" },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`size-2.5 rounded-full ${row.dot}`} />
                          <span className="text-sm font-medium">{row.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -start-4 top-8 hidden animate-float rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/5 sm:block">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Trophy className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold">+١٥ نقطة</p>
                    <p className="text-[10px] text-muted-foreground">أحمد حصل على نقاط</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -end-4 bottom-12 hidden animate-float-delay rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/5 sm:block"
              >
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    <Bell className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-bold">إشعار جديد</p>
                    <p className="text-[10px] text-muted-foreground">تم تسجيل الحضور</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ FEATURES ══════════════════════ */}
        <section id="features" className="relative px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <Badge
                variant="outline"
                className="mb-3 border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
              >
                المميزات
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                كل ما تحتاجه{" "}
                <span className="text-gradient">في مكان واحد</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                أدوات قوية صُممت خصيصاً للمدرس العربي
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <article
                  key={f.title}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* gradient top line */}
                  <div
                    className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${f.color} opacity-0 transition-opacity group-hover:opacity-100`}
                  />

                  <span
                    className={`inline-grid size-11 place-items-center rounded-2xl ${f.soft} ${f.text} transition-transform group-hover:scale-110`}
                  >
                    <f.icon className="size-5" />
                  </span>

                  <h3 className="mt-4 text-base font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
        <section className="relative overflow-hidden px-4 py-20 sm:px-6">
          {/* Gradient BG */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-violet-50/80 via-background to-cyan-50/50 dark:from-violet-950/20 dark:to-cyan-950/10"
          />

          <div className="mx-auto max-w-5xl">
            <div className="mx-auto mb-14 max-w-xl text-center">
              <Badge
                variant="outline"
                className="mb-3 border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300"
              >
                كيف يعمل
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                ابدأ في <span className="text-gradient">٣ خطوات</span> فقط
              </h2>
            </div>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connecting line */}
              <div
                aria-hidden
                className="absolute start-[16.66%] end-[16.66%] top-7 hidden h-0.5 bg-gradient-to-r from-violet-300 via-cyan-300 to-amber-300 md:block"
              />

              {[
                {
                  step: "١",
                  icon: BookOpen,
                  title: "أنشئ مجموعتك",
                  body: "سجّل حساباً في ثوانٍ وأنشئ مجموعتك الأولى.",
                  color: "from-violet-500 to-violet-600",
                  ring: "ring-violet-200 dark:ring-violet-800",
                },
                {
                  step: "٢",
                  icon: Users,
                  title: "أضف طلابك",
                  body: "شارك رابط الانضمام مع طلابك أو أضفهم يدوياً.",
                  color: "from-cyan-500 to-cyan-600",
                  ring: "ring-cyan-200 dark:ring-cyan-800",
                },
                {
                  step: "٣",
                  icon: Zap,
                  title: "ابدأ التفاعل",
                  body: "سجّل الحضور، انشر، وشاهد الطلاب يتنافسون على النقاط.",
                  color: "from-amber-500 to-amber-600",
                  ring: "ring-amber-200 dark:ring-amber-800",
                },
              ].map((s) => (
                <div key={s.step} className="relative flex flex-col items-center text-center">
                  <span
                    className={`relative z-10 grid size-14 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg ring-4 ${s.ring}`}
                  >
                    <s.icon className="size-6" />
                  </span>
                  <span className="absolute -top-2 -start-2 z-20 grid size-6 place-items-center rounded-full bg-card text-xs font-bold ring-2 ring-border">
                    {s.step}
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ PRICING ══════════════════════ */}
        <section id="pricing" className="px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <Badge
                variant="outline"
                className="mb-3 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
              >
                الأسعار
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                خطط تناسب <span className="text-gradient">كل احتياج</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                ابدأ مجاناً وطوّر خطتك عندما تحتاج
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={[
                    "relative overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1",
                    plan.highlighted
                      ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-2xl shadow-violet-500/40"
                      : "border border-border/60 bg-card shadow-sm hover:shadow-md",
                  ].join(" ")}
                >
                  {plan.highlighted && (
                    <>
                      {/* Shimmer orbs */}
                      <div
                        aria-hidden
                        className="absolute -top-10 -end-10 size-40 rounded-full bg-white/10 blur-2xl"
                      />
                      <div
                        aria-hidden
                        className="absolute -bottom-10 -start-10 size-40 rounded-full bg-cyan-400/20 blur-2xl"
                      />
                      <Badge className="mb-3 border-0 bg-white/20 text-white">
                        الأكثر شيوعاً
                      </Badge>
                    </>
                  )}

                  <p className={["text-sm font-medium", plan.highlighted ? "text-violet-200" : "text-muted-foreground"].join(" ")}>
                    {plan.name}
                  </p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className={["text-sm", plan.highlighted ? "text-violet-200" : "text-muted-foreground"].join(" ")}>
                      ج.م / شهر
                    </span>
                  </div>
                  <p className={["mt-1 text-xs", plan.highlighted ? "text-violet-200" : "text-muted-foreground"].join(" ")}>
                    {plan.desc}
                  </p>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2
                          className={["size-4 shrink-0", plan.highlighted ? "text-cyan-300" : "text-emerald-500"].join(" ")}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={[
                      "mt-8 w-full",
                      plan.highlighted
                        ? "bg-white text-violet-700 hover:bg-white/90"
                        : "",
                    ].join(" ")}
                    variant={plan.highlighted ? "default" : "outline"}
                    
                  >
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ TESTIMONIALS ══════════════════════ */}
        <section id="testimonials" className="relative overflow-hidden px-4 py-20 sm:px-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-violet-50/30 to-background dark:via-violet-950/10"
          />

          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <Badge
                variant="outline"
                className="mb-3 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              >
                آراء المستخدمين
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                مدرسون يثقون في{" "}
                <span className="text-gradient">EduTrack</span>
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    aria-hidden
                    className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${t.color} opacity-0 transition-opacity group-hover:opacity-100`}
                  />

                  {/* Stars */}
                  <div className="mb-3 flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>

                  <blockquote className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.body}&rdquo;
                  </blockquote>

                  <figcaption className="mt-4 flex items-center gap-3">
                    <span
                      className={`grid size-10 place-items-center rounded-2xl bg-gradient-to-br ${t.color} text-base font-bold text-white`}
                    >
                      {t.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-bold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════ CTA BANNER ══════════════════════ */}
        <section className="px-4 pb-24 pt-8 sm:px-6">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-animated p-px shadow-2xl shadow-violet-500/30">
            <div className="rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-8 py-14 text-center text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(1.5rem-1px)]"
              >
                <div className="absolute -top-12 -end-12 size-48 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-12 -start-12 size-48 rounded-full bg-cyan-400/20 blur-3xl" />
              </div>

              <div className="relative">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium">
                  <Sparkles className="size-4 text-amber-300" />
                  ابدأ اليوم — مجاناً
                </span>

                <h2 className="mt-2 text-3xl font-extrabold sm:text-5xl">
                  جاهز لتحويل
                  <br />
                  طريقة تدريسك؟
                </h2>

                <p className="mx-auto mt-4 max-w-md text-violet-200">
                  انضم لآلاف المدرسين الذين يوفرون وقتهم ويحسّنون تفاعل طلابهم مع EduTrack.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-violet-700 hover:bg-white/90 shadow-xl gap-2 group"
                    
                  >
                    <Link href="/register">
                      ابدأ مجاناً الآن
                      <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-transparent text-white hover:bg-white/10"
                    
                  >
                    <Link href="/login">لديّ حساب بالفعل</Link>
                  </Button>
                </div>

                {/* Social proof */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-violet-200">
                  <span className="flex items-center gap-1.5">
                    <Shield className="size-4 text-cyan-300" />
                    مشفر وآمن ١٠٠٪
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-4 text-cyan-300" />
                    +٥٠٠٠ مدرس نشط
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-cyan-300" />
                    بدون بطاقة ائتمان
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer className="border-t border-border/60 bg-muted/30 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-start">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 text-white">
                <GraduationCap className="size-4" />
              </span>
              <span className="text-sm font-bold">
                <span className="text-gradient">Edu</span>Track
              </span>
            </Link>

            <nav className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
              {["الخصوصية", "الشروط", "التواصل", "المساعدة"].map((l) => (
                <a key={l} href="#" className="hover:text-foreground transition-colors">
                  {l}
                </a>
              ))}
            </nav>

            <p className="text-xs text-muted-foreground">
              © ٢٠٢٦ EduTrack — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
