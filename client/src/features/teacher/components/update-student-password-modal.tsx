"use client"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { updateStudentPasswordAction } from "@/features/teacher/actions/student.action"
import { CheckCircle2, Eye, EyeOff, KeyRound, Lock, X } from "lucide-react"
import { useState, useTransition } from "react"

interface UpdateStudentPasswordModalProps {
  student: { id: string; name: string }
  groupId?: string
  onClose: () => void
  onSuccess?: () => void
}

export function UpdateStudentPasswordModal({
  student,
  groupId,
  onClose,
  onSuccess,
}: UpdateStudentPasswordModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل")
      return
    }
    setError(null)

    startTransition(async () => {
      const res = await updateStudentPasswordAction(student.id, password, groupId)
      if (res.error) {
        setError(res.error)
      } else {
        setSuccess(true)
        if (onSuccess) onSuccess()
        setTimeout(() => {
          onClose()
        }, 1200)
      }
    })
  }

  const setSuggestedPassword = (suggested: string) => {
    setPassword(suggested)
    setError(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !isPending) onClose() }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-card border border-border/60 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <KeyRound className="size-4 text-violet-500" />
            تغيير كلمة المرور
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {success ? (
            <div className="py-4 text-center space-y-2">
              <CheckCircle2 className="mx-auto size-12 text-emerald-500 animate-in zoom-in-75 duration-200" />
              <p className="font-bold text-sm">تم تحديث كلمة المرور بنجاح!</p>
              <p className="text-xs text-muted-foreground">يمكن للطالب تسجيل الدخول بكلمة المرور الجديدة الآن.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  تعديل كلمة مرور الطالب: <span className="font-bold text-foreground">{student.name}</span>
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور جديدة..."
                    className="pe-10"
                    disabled={isPending}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1">
                <p className="text-[11px] text-muted-foreground">اقتراحات سريعة:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Edu@2026", "12345678", "Pass@123"].map(suggestion => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setSuggestedPassword(suggestion)}
                      className="rounded-lg border border-border/60 bg-muted/50 px-2 py-1 text-[11px] font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-2xl"
                  onClick={onClose}
                  disabled={isPending}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90 font-bold"
                  disabled={isPending}
                >
                  <Lock className="size-3.5" />
                  {isPending ? "جارٍ الحفظ..." : "حفظ التغيير"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
