"use client"

import { deleteGroupAction } from "@/features/admin/actions/group.action"
import { Button } from "@/shared/components/ui/button"
import { useState, useTransition } from "react"

export function DeleteGroupModal({
  groupId,
  onClose,
}: {
  groupId: string
  onClose: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleDelete = () => {
    setError(null)
    startTransition(async () => {
      const result = await deleteGroupAction(groupId)
      if (result.error) setError(result.error)
      else onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-3xl bg-background border border-border/60 shadow-2xl p-6 text-center space-y-4">
        <p className="text-4xl">🗑️</p>
        <p className="font-bold">حذف المجموعة؟</p>
        <p className="text-sm text-muted-foreground">هذا الإجراء لا يمكن التراجع عنه</p>
        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>إلغاء</Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}
          </Button>
        </div>
      </div>
    </div>
  )
}