"use client"

import { addTeacherToGroupAction } from "@/features/admin/actions/group.action"
import { Button } from "@/shared/components/ui/button"
import { ApiUser, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { Plus, X } from "lucide-react"
import { useRef, useState, useTransition } from "react"

export function AddGroupTeacherModal({
  groupId,
  allTeachers,
  currentTeacherIds,
  onClose,
}: {
  groupId: string
  allTeachers: ApiUser[]
  currentTeacherIds: string[]
  onClose: () => void
}) {
  const available = allTeachers.filter(
    t => !currentTeacherIds.includes(resolveId(t))
  )

  const overlayRef = useRef<HTMLDivElement>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleAdd = (teacherId: string) => {
    setAdding(teacherId)
    setError(null)
    startTransition(async () => {
      const result = await addTeacherToGroupAction(groupId, teacherId)
      if (result.error) { setError(result.error); setAdding(null) }
      else onClose()
    })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="text-base font-bold">إضافة مدرس للمجموعة</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-80 overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {available.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              جميع المدرسين مضافون بالفعل إلى هذه المجموعة
            </p>
          ) : (
            available.map(t => {
              const tid = resolveId(t)
              return (
                <div key={tid} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary dark:bg-primary/20 dark:text-primary shrink-0">
                    {t.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                  </div>
                  <Button
                    size="sm"
                    className={cn("shrink-0 bg-primary text-primary-foreground border-2 border-primary hover:bg-primary-hover hover:border-primary-hover hover:text-primary-hover-foreground")}
                    onClick={() => handleAdd(tid)}
                    disabled={adding === tid}
                  >
                    <Plus className="size-3.5" />
                    {adding === tid ? "..." : "إضافة"}
                  </Button>
                </div>
              )
            })
          )}
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="w-full" onClick={onClose} disabled={isPending}>إغلاق</Button>
        </div>
      </div>
    </div>
  )
}