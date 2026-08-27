import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  BarChart3,
  Bell,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  MessageCircle,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react"
import Link from "next/link"

const features = [
  { icon: Users,         title: "مجموعات منظّمة",       body: "أنشئ مجموعة لكل صف، أضف الطلاب والمدرسين، وتابع كل شيء من لوحة واحدة.",          color: "from-violet-500 to-violet-600", soft: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600 dark:text-violet-400" },
  { icon: CalendarCheck, title: "حضور في ثوانٍ",         body: "سجّل الحضور بضغطة واحدة لكل طالب، مع سجل كامل وإحصائيات دقيقة.",              color: "from-cyan-500 to-cyan-600",    soft: "bg-cyan-50 dark:bg-cyan-900/20",    text: "text-cyan-600 dark:text-cyan-400"   },
  { icon: Trophy,        title: "ترتيب ونقاط",           body: "نقاط تلقائية على الحضور مع لوحة ترتيب تحفّز الطلاب على المنافسة الإيجابية.",   color: "from-amber-500 to-amber-600",  soft: "bg-amber-50 dark:bg-amber-900/20",  text: "text-amber-600 dark:text-amber-400" },
  { icon: MessageCircle, title: "تفاعل داخل المجموعة",   body: "منشورات وإعلانات وتعليقات وردود بين المدرس وطلابه في مكان آمن.",              color: "from-emerald-500 to-emerald-600",soft:"bg-emerald-50 dark:bg-emerald-900/20",text:"text-emerald-600 dark:text-emerald-400"},
  { icon: Bell,          title: "إشعارات فورية",         body: "تنبيه الطلاب بكل منشور جديد أو رد أو تسجيل حضور فور حدوثه.",                  color: "from-rose-500 to-rose-600",    soft: "bg-rose-50 dark:bg-rose-900/20",    text: "text-rose-600 dark:text-rose-400"   },
  { icon: BarChart3,     title: "تقارير واضحة",          body: "نِسَب الحضور والنمو الشهري في رسوم بيانية سهلة القراءة للمدرس والإدارة.",       color: "from-violet-500 to-cyan-500",  soft: "bg-primary-soft",                   text: "text-primary"                       },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="grid size-9 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/30 transition-transform group-hover:scale-110">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-base font-bold"><span className="text-gradient">Edu</span>Track</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#how" className="hover:text-foreground transition-colors">كيف يعمل</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" ><Link href="/login">تسجيل الدخول</Link></Button>
            <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-sm shadow-violet-500/30 hover:opacity-90" >
              <Link href="/register">ابدأ مجاناً</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 -start-20 size-[500px] rounded-full bg-violet-500/15 blur-[100px] animate-pulse-slow" />
            <div className="absolute top-1/3 -end-20 size-[350px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
            <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/></svg>
          </div>

          <div className="mx-auto max-w-2xl text-center animate-slide-up">
            <Badge variant="secondary" className="mb-5 gap-1.5 border border-violet-200 bg-violet-50 px-3 py-1 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
              <Sparkles className="size-3" /> منصة عربية متكاملة للتعليم
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              نظّم مجموعاتك
              <br /><span className="text-gradient">وتابع حضور طلابك</span><br />بسهولة
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              منصة عربية واحدة تساعد المدرسين على إدارة الطلاب والحضور والتواصل داخل المجموعات — بدون تعقيد.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="group gap-2 bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90" >
                <Link href="/register?role=teacher">ابدأ كمدرس <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-1" /></Link>
              </Button>
              <Button size="lg" variant="outline" >
                <Link href="/register?role=student">انضم كطالب</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              {["مجاني تماماً", "بدون بطاقة ائتمان", "آمن ومشفر"].map(t => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-emerald-500" />{t}</span>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-14 max-w-3xl animate-slide-up-delay">
            <div className="relative rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50 to-cyan-50/40 p-1 shadow-2xl shadow-violet-500/15 dark:border-violet-900/40 dark:from-violet-950/40 dark:to-cyan-950/20">
              <div className="rounded-[1.4rem] bg-card p-5 sm:p-7">
                <div className="mb-4 flex items-center gap-2">
                  <span className="size-3 rounded-full bg-rose-400" /><span className="size-3 rounded-full bg-amber-400" /><span className="size-3 rounded-full bg-emerald-400" />
                  <span className="mx-auto h-6 w-44 rounded-full bg-muted" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[{k:"١١٢",v:"طالب نشط",c:"from-violet-500 to-violet-600"},{k:"٨٦٪",v:"نسبة الحضور",c:"from-cyan-500 to-cyan-600"},{k:"٦٣",v:"منشور هذا الشهر",c:"from-amber-500 to-amber-600"}].map(s=>(
                    <div key={s.v} className={`rounded-2xl bg-gradient-to-br ${s.c} p-4 text-center text-white`}>
                      <p className="text-2xl font-bold">{s.k}</p>
                      <p className="mt-0.5 text-xs opacity-80">{s.v}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {[{n:"أحمد محمد",s:"حاضر",d:"bg-emerald-500"},{n:"سارة إبراهيم",s:"حاضر",d:"bg-emerald-500"},{n:"عمر خالد",s:"غائب",d:"bg-rose-400"},{n:"نورا حسن",s:"متأخر",d:"bg-amber-400"}].map(r=>(
                    <div key={r.n} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-2.5">
                      <div className="flex items-center gap-3"><span className={`size-2.5 rounded-full ${r.d}`}/><span className="text-sm font-medium">{r.n}</span></div>
                      <span className="text-xs text-muted-foreground">{r.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -start-4 top-8 hidden animate-float rounded-2xl bg-card p-3 shadow-lg ring-1 ring-foreground/5 sm:block">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-600"><Trophy className="size-4"/></span>
                <div><p className="text-xs font-bold">+١ نقطة</p><p className="text-[10px] text-muted-foreground">أحمد — حضور مسجل</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">كل ما تحتاجه <span className="text-gradient">في مكان واحد</span></h2>
              <p className="mt-2 text-sm text-muted-foreground">أدوات بُنيت خصيصاً للمدرس العربي</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <article key={f.title} className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${f.color} opacity-0 transition-opacity group-hover:opacity-100`}/>
                  <span className={`inline-grid size-10 place-items-center rounded-2xl ${f.soft} ${f.text}`}><f.icon className="size-5"/></span>
                  <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="relative overflow-hidden px-4 py-16 sm:px-6">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-violet-50/60 via-background to-cyan-50/40 dark:from-violet-950/15 dark:to-cyan-950/10"/>
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">ابدأ في <span className="text-gradient">٣ خطوات</span></h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {step:"١",title:"سجّل كمدرس",body:"أنشئ حسابك في ثوانٍ وأنشئ مجموعتك الأولى.",color:"from-violet-500 to-violet-600"},
                {step:"٢",title:"أضف طلابك",body:"شارك رابط الانضمام أو أضف الطلاب يدوياً.",color:"from-cyan-500 to-cyan-600"},
                {step:"٣",title:"ابدأ الحصة",body:"سجّل الحضور وانشر وشاهد الطلاب يتنافسون.",color:"from-amber-500 to-amber-600"},
              ].map(s=>(
                <div key={s.step} className="flex flex-col items-center text-center">
                  <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${s.color} text-xl font-extrabold text-white shadow-lg`}>{s.step}</span>
                  <h3 className="mt-4 font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-3 gap-4 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              {[{k:"+٥٠٠٠",v:"مدرس نشط"},{k:"+٨٠٠٠٠",v:"طالب مسجل"},{k:"٨٨٪",v:"متوسط الحضور"}].map(s=>(
                <div key={s.v} className="text-center">
                  <p className="text-2xl font-extrabold text-primary sm:text-3xl">{s.k}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 pt-4 sm:px-6">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-800 px-8 py-14 text-center text-white shadow-2xl shadow-violet-500/25">
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-12 -end-12 size-48 rounded-full bg-white/10 blur-3xl"/>
              <div className="absolute -bottom-12 -start-12 size-48 rounded-full bg-cyan-400/15 blur-3xl"/>
            </div>
            <h2 className="relative text-2xl font-extrabold sm:text-4xl">جاهز لتحويل طريقة تدريسك؟</h2>
            <p className="relative mt-3 text-violet-200">انضم لآلاف المدرسين الذين يوفرون وقتهم مع EduTrack.</p>
            <div className="relative mt-7 flex flex-wrap justify-center gap-3">
              <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 shadow-lg" >
                <Link href="/register?role=teacher">ابدأ كمدرس</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" >
                <Link href="/register?role=student">انضم كطالب</Link>
              </Button>
            </div>
            <div className="relative mt-6 flex flex-wrap justify-center gap-5 text-xs text-violet-200">
              <span className="flex items-center gap-1.5"><Shield className="size-3.5 text-cyan-300"/>مشفر وآمن</span>
              <span className="flex items-center gap-1.5"><Users className="size-3.5 text-cyan-300"/>+٥٠٠٠ مدرس</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5 text-cyan-300"/>مجاني تماماً</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-muted/30 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white"><GraduationCap className="size-3.5"/></span>
            <span className="text-sm font-bold"><span className="text-gradient">Edu</span>Track</span>
          </Link>
          <nav className="flex gap-5 text-xs text-muted-foreground">
            {["الخصوصية","الشروط","التواصل"].map(l=><a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>)}
          </nav>
          <p className="text-xs text-muted-foreground">© ٢٠٢٦ EduTrack</p>
        </div>
      </footer>
    </div>
  )
}
