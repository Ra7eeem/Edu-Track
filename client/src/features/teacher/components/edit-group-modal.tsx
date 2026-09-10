"use client"

import { useRef, useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { GradesSelector } from "@/features/teacher/components/grades-selector"
import { useUpdateGroup } from "@/features/teacher/hooks/use-teacher-groups"
import { ApiGroup, Grade, resolveId } from "@/shared/types/api"
import { CheckCircle2, Save, X } from "lucide-react"

interface EditGroupModalProps {
  group:   ApiGroup
  onClose: () => void
}

const sorted = (grades: Grade[] = []) => [...grades].sort().join(",")

export function EditGroupModal({ group, onClose }: EditGroupModalProps) {
  const updateMut   = useUpdateGroup()
  const overlayRef  = useRef<HTMLDivElement>(null)

  const [name,        setName]        = useState(group.name ?? "")
  const [description, setDescription] = useState(group.description ?? "")
  const [grades,      setGrades]      = useState<Grade[]>(group.grades ?? [])
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  const handleSubmit = async () => {
    if (updateMut.isPending) return

    const trimmed = name.trim()
    if (!trimmed) { setError("اسم المجموعة مطلوب"); return }
    if (trimmed.length < 2) { setError("اسم المجموعة يجب ألا يقل عن حرفين"); return }
    setError(null)

    // Nothing changed → close without a server write (the server PATCH has the
    // final word on authorization; this is purely an unnecessary-write guard).
    const desc = description.trim()
    const unchanged =
      trimmed === (group.name ?? "").trim() &&
      desc    === (group.description ?? "").trim() &&
      sorted(grades) === sorted(group.grades ?? [])
    if (unchanged) { onClose(); return }

    try {
      await updateMut.mutateAsync({
        groupId:     resolveId(group),
        name:        trimmed,
        description: desc,   // always send so clearing the description persists
        grades,
      })
      setSaved(true)
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "حدث خطأ أثناء تعديل المجموعة")
    }
  }

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm space-y-4 rounded-3xl border border-border/60 bg-background p-6 text-center shadow-2xl">
          <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
          <p className="font-bold">تم تحديث المجموعة بنجاح</p>
          <Button className="w-full bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" onClick={onClose}>
            حسناً
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Save className="size-4 text-violet-500" />
            إعدادات المجموعة
          </h2>
          <button
            onClick={onClose}
            className="grid size-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-5">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">اسم المجموعة *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="اسم المجموعة"
              autoFocus
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف (اختياري)</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف مختصر عن المجموعة..."
              rows={2}
              className="flex w-full resize-none rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-3 focus:ring-primary/20"
            />
          </div>
          <GradesSelector selected={grades} onChange={setGrades} />
        </div>

        <div className="flex shrink-0 gap-2 border-t border-border/60 px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={updateMut.isPending}>
            إلغاء
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit}
            disabled={updateMut.isPending}
          >
            {updateMut.isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </Button>
        </div>
      </div>
    </div>
  )
}