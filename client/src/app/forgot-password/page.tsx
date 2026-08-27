"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { GraduationCap, Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 start-1/2 size-[400px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px] animate-pulse-slow"/>
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-7 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-md">
              <GraduationCap className="size-5"/>
            </span>
            <span className="text-lg font-bold"><span className="text-gradient">Edu</span>Track</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-lg">
          {!sent ? (
            <>
              <h1 className="text-xl font-extrabold">نسيت كلمة المرور؟</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>
              <form className="mt-6 space-y-4" onSubmit={e=>{e.preventDefault();setSent(true)}} noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="you@example.com" startIcon={<Mail/>} required/>
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90">
                  إرسال رابط الإعادة
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <span className="text-4xl">📧</span>
              <h2 className="mt-4 text-lg font-bold">تم الإرسال!</h2>
              <p className="mt-2 text-sm text-muted-foreground">تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.</p>
              <Button className="mt-6 w-full" variant="outline" asChild>
                <Link href="/login">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">← العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
