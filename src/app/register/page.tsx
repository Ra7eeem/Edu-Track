"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { mockGroups } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { BookOpen, ChevronDown, Eye, EyeOff, GraduationCap, Lock, Mail, User } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

type Role = "teacher" | "student"

function RegisterForm() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get("role") as Role) ?? "teacher"
  const [role, setRole] = useState<Role>(initialRole)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState("")

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* bg blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -start-32 size-[450px] rounded-full bg-violet-500/12 blur-[100px] animate-pulse-slow"/>
        <div className="absolute -bottom-20 -end-20 size-[350px] rounded-full bg-cyan-500/10 blur-[80px] animate-pulse-slow" style={{animationDelay:"2s"}}/>
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo */}
          <div className="mb-7 flex flex-col items-center">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md shadow-violet-500/30">
                <GraduationCap className="size-5"/>
              </span>
              <span className="text-lg font-bold"><span className="text-gradient">Edu</span>Track</span>
            </Link>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-lg">
            <h1 className="text-xl font-extrabold tracking-tight">إنشاء حساب جديد</h1>
            <p className="mt-1 text-sm text-muted-foreground">مجاني تماماً — ابدأ الآن</p>

            {/* Role selector */}
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-input bg-muted/40 p-1.5">
              {([["teacher","مدرس",BookOpen],["student","طالب",GraduationCap]] as [Role,string,React.ElementType][]).map(([v,l,Icon])=>(
                <button key={v} type="button" onClick={()=>setRole(v)}
                  className={cn("flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    role===v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="size-4"/>{l}
                </button>
              ))}
            </div>

            <form className="mt-5 space-y-4" onSubmit={e=>e.preventDefault()} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="fullname">الاسم الكامل</Label>
                <Input id="fullname" type="text" placeholder="محمد أحمد" autoComplete="name" startIcon={<User/>} required/>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" startIcon={<Mail/>} required/>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type={showPassword?"text":"password"} placeholder="٨ أحرف على الأقل" autoComplete="new-password" startIcon={<Lock/>}
                  endIcon={<button type="button" onClick={()=>setShowPassword(v=>!v)} className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">{showPassword?<EyeOff/>:<Eye/>}</button>} required/>
              </div>

              {/* Group select — students only */}
              {role === "student" && (
                <div className="space-y-1.5">
                  <Label htmlFor="group">اختر مجموعتك</Label>
                  <div className="relative">
                    <select
                      id="group"
                      value={selectedGroup}
                      onChange={e=>setSelectedGroup(e.target.value)}
                      required
                      className={cn(
                        "flex h-11 w-full appearance-none rounded-2xl border border-input bg-background px-3.5 pe-10 py-2 text-sm text-foreground shadow-sm",
                        "transition-all duration-200 outline-none",
                        "focus:border-primary focus:ring-3 focus:ring-primary/20",
                        !selectedGroup && "text-muted-foreground/60"
                      )}
                    >
                      <option value="" disabled>-- اختر مجموعتك --</option>
                      {mockGroups.map(g=>(
                        <option key={g.id} value={g.id}>
                          {g.name} — {g.subject} ({g.studentCount} طالب)
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                  </div>
                  {selectedGroup && (
                    <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
                      {(() => {
                        const g = mockGroups.find(x=>x.id===selectedGroup)
                        return g ? `${g.name} · ${g.schedule}` : ""
                      })()}
                    </div>
                  )}
                </div>
              )}

              <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                <input type="checkbox" className="mt-0.5 size-4 rounded border-input accent-primary" required/>
                <span className="text-muted-foreground leading-snug text-xs">
                  أوافق على <a href="#" className="text-primary hover:underline font-medium">شروط الاستخدام</a> و<a href="#" className="text-primary hover:underline font-medium">سياسة الخصوصية</a>
                </span>
              </label>

              <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/25 hover:opacity-90">
                {role === "teacher" ? "إنشاء حساب مدرس" : "إنشاء حساب طالب"}
              </Button>
            </form>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            لديك حساب؟ <Link href="/login" className="font-semibold text-primary hover:underline">سجّل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm/>
    </Suspense>
  )
}
