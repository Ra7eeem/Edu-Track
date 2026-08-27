import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { BarChart3, Bell, CalendarCheck, GraduationCap, MessageCircle, Trophy, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: Users,
    title: "مجموعات منظّمة",
    body: "أنشئ مجموعة لكل صف، أضف الطلاب والمدرسين، وتابع كل شيء من لوحة واحدة.",
  },
  {
    icon: CalendarCheck,
    title: "حضور في ثوانٍ",
    body: "سجّل الحضور بضغطة واحدة لكل طالب، مع سجل كامل وإحصائيات دقيقة.",
  },
  {
    icon: MessageCircle,
    title: "تفاعل داخل المجموعة",
    body: "منشورات وإعلانات وتعليقات وردود بين المدرس وطلابه في مكان آمن.",
  },
  {
    icon: Trophy,
    title: "ترتيب ونقاط",
    body: "نقاط تلقائية على الحضور والمشاركة مع لوحة ترتيب تحفّز الطلاب.",
  },
  {
    icon: Bell,
    title: "إشعارات فورية",
    body: "تنبيه الطلاب بكل منشور جديد أو رد أو تسجيل حضور.",
  },
  {
    icon: BarChart3,
    title: "تقارير واضحة",
    body: "نِسَب الحضور والنمو الشهري في رسوم بيانية سهلة القراءة.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="font-display text-base font-bold">مجموعتي</span>
          </span>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
            <Button size="sm">
              <Link href="/register">إنشاء حساب</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              نسخة تجريبية ببيانات واقعية
            </Badge>
            <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-5xl">
              إدارة مجموعاتك وحضور طلابك
              <span className="text-primary"> بلا تعقيد</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              منصة عربية واحدة للمدرس والطالب: مجموعات، تسجيل حضور سريع، منشورات وتعليقات،
              ولوحة ترتيب تحفّز الطلاب على الاستمرار.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2.5">
              <Button size="lg">
                <Link href="/teacher">تجربة لوحة المدرس</Link>
              </Button>
              <Button size="lg" variant="outline">
                <Link href="/student">تجربة حساب الطالب</Link>
              </Button>
              <Button size="lg" variant="ghost">
                <Link href="/admin">لوحة الإدارة</Link>
              </Button>
            </div>
          </div>

          <dl className="mt-14 grid gap-3 sm:grid-cols-3">
            {[
              { k: "112", v: "طالب نشط" },
              { k: "%86", v: "متوسط نسبة الحضور" },
              { k: "63", v: "منشورًا هذا الشهر" },
            ].map((s) => (
              <div key={s.v} className="card-soft p-5 text-center">
                <dt className="font-display text-3xl font-bold text-primary">{s.k}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <h2 className="mb-6 text-center font-display text-2xl font-bold">
            كل ما تحتاجه لإدارة مجموعاتك
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <article key={f.title} className="card-soft p-5">
                <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <f.icon className="size-5" />
                </span>
                <h3 className="mt-3 text-base font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{f.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        منصة مجموعتي — جميع الحقوق محفوظة © 2026
      </footer>
    </div>
  );
}
