"use client"

import { Button } from "@/shared/components/ui/button"
import { useTeacherCreateGroup } from "@/features/teacher/hooks/use-teacher-groups"
import { Grade, GRADE_LABELS } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { Plus, X } from "lucide-react"
import { useRef, useState } from "react"

function GradesSelector({ selected, onChange }: { selected: Grade[]; onChange: (g: Grade[]) => void }) {
  const toggle = (g: Grade) =>
    onChange(selected.includes(g) ? selected.filter(x => x !== g) : [...selected, g])
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        الصفوف المستهدفة
        <span className="ms-1 text-muted-foreground/60">(اتركها فارغة لكل الصفوف)</span>
      </label>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(GRADE_LABELS).map(([val, label]) => {
          const g = val as Grade; const sel = selected.includes(g)
          return (
            <button key={g} type="button" onClick={() => toggle(g)}
              className={cn("rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                sel ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground")}>
              {sel && <span className="me-1">✓</span>}{label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && <p className="text-[10px] text-primary">{selected.length} صف مختار</p>}
    </div>
  )
}

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const createMut  = useTeacherCreateGroup()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [grades,      setGrades]      = useState<Grade[]>([])
  const [error,       setError]       = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!name.trim()) { setError("اسم المجموعة مطلوب"); return }
    setError(null)
    try {
      await createMut.mutateAsync({
        name:        name.trim(),
        description: description.trim() || undefined,
        grades:      grades.length > 0 ? grades : undefined,
      })
      onClose()
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "حدث خطأ")
    }
  }

  return (
    <div ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}>
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <h2 className="text-base font-bold">إنشاء مجموعة جديدة</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">اسم المجموعة *</label>
            <input value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="مثال: مجموعة الرياضيات — الصف العاشر" autoFocus
              className="flex h-10 w-full rounded-2xl border border-input bg-card px-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">الوصف (اختياري)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="وصف مختصر عن المجموعة..." rows={2}
              className="flex w-full rounded-2xl border border-input bg-card px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all" />
          </div>
          <GradesSelector selected={grades} onChange={setGrades} />
        </div>

        <div className="flex gap-2 border-t border-border/60 px-5 py-4 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit} disabled={createMut.isPending}>
            <Plus className="size-4" />{createMut.isPending ? "جارٍ الإنشاء..." : "إنشاء المجموعة"}
          </Button>
        </div>
      </div>
    </div>
  )
}
