"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Mail } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10 font-sans text-foreground">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="mb-6 text-center">
          <Link href="/" className="font-display font-bold text-3xl text-heading">
            معراج
          </Link>
        </div>

        <div className="rounded border border-border bg-card p-7 shadow-sm">
          {!sent ? (
            <>
              <h1 className="font-display text-2xl font-bold text-heading">نسيت كلمة المرور؟</h1>
              <p className="mt-1 text-sm text-muted-foreground">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>
              <form className="mt-6 space-y-4" onSubmit={e => { e.preventDefault(); setSent(true) }} noValidate>
                <div className="space-y-1.5">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input id="email" type="email" placeholder="you@example.com" startIcon={<Mail />} required />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground"
                >
                  إرسال رابط الإعادة
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <span className="text-4xl">📧</span>
              <h2 className="mt-4 font-display text-xl font-bold text-heading">تم الإرسال!</h2>
              <p className="mt-2 text-sm text-muted-foreground">تحقق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.</p>
              <Button className="mt-6 w-full" variant="outline" asChild>
                <Link href="/login">العودة لتسجيل الدخول</Link>
              </Button>
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-accent hover:underline">← العودة لتسجيل الدخول</Link>
        </p>
      </div>
    </div>
  )
}
