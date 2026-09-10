"use client"

import { ApiUser } from "@/shared/types/api"
import { Button } from "@/shared/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useTransition, useState } from "react"
import { deleteTeacherAction } from "@/features/admin/actions/teacher.action"

export function DeleteTeacherModal({
  target,
  onClose,
}: {
  target: ApiUser
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const confirm = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteTeacherAction(target._id ?? target.id ?? "")
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isPending && onClose()}
    >
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl animate-slide-up">
        <div className="mb-4 flex justify-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            <AlertTriangle className="size-7" />
          </span>
        </div>

        <h2 className="text-center text-base font-bold">حذف المدرس</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground leading-relaxed">
          هل أنت متأكد من حذف حساب{" "}
          <span className="font-semibold text-foreground">{target.name}</span>؟
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          سيتم حذف الحساب نهائياً ولا يمكن التراجع عن هذا الإجراء.
        </p>

        {error && (
          <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            className="flex-1 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400"
            onClick={confirm}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            {isPending ? "جارٍ الحذف..." : "نعم، احذف"}
          </Button>
        </div>
      </div>
    </div>
  )
}