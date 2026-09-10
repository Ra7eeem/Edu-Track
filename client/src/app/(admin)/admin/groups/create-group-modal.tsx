"use client"

import { createGroupAction, GroupActionState } from "@/features/admin/actions/group.action"
import { Button } from "@/shared/components/ui/button"
import { Grade, GRADE_LABELS, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { Plus, X } from "lucide-react"
import { useActionState, useRef, useState } from "react"

// ─── Grades multi-selector ────────────────────────────────────────────────────
function GradesSelector({
  selected, onChange,
}: { selected: Grade[]; onChange: (g: Grade[]) => void }) {
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
          const g   = val as Grade
          const sel = selected.includes(g)
          return (
            <button
              key={g}
              type="button"
              onClick={() => toggle(g)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                sel
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {sel && <span className="me-1">✓</span>}
              {label}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-[10px] text-primary">{selected.length} صف مختار</p>
      )}
    </div>
  )
}

export function CreateGroupModal({
  allTeachers,
  onClose,
}: {
  allTeachers: { id?: string; _id?: string; name: string; email: string }[]
  onClose: () => void
}) {
  const [state, formAction, isPending] = useActionState<GroupActionState, FormData>(createGroupAction, {})
  const overlayRef = useRef<HTMLDivElement>(null)

  const [name,        setName]        = useState("")
  const [description, setDescription] = useState("")
  const [grades,      setGrades]      = useState<Grade[]>([])
  const [teacherIds,  setTeacherIds]  = useState<string[]>([])
  const [error,       setError]       = useState<string | null>(null)

  const toggleTeacher = (id: string) =>
    setTeacherIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])

  const handleSubmit = () => {
    if (!name.trim()) { setError("اسم المجموعة مطلوب"); return }
    setError(null)
    const fd = new FormData()
    fd.set("name", name.trim())
    if (description.trim()) fd.set("description", description.trim())
    grades.forEach(g => fd.append("grades", g))
    teacherIds.forEach(t => fd.append("teacherIds", t))
    formAction(fd)
  }

  if (state.success) {
    onClose()
    return null
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-md rounded-3xl bg-background border border-border/60 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <h2 className="text-base font-bold">إنشاء مجموعة جديدة</h2>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-4">
          {(error || state.error) && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {state.error ?? error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">اسم المجموعة *</label>
            <input value={name} onChange={e => setName(e.target.value)}
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

          {allTeachers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">إسناد مدرسين (اختياري)</label>
              <div className="max-h-40 overflow-y-auto space-y-1 rounded-2xl border border-input bg-card p-2">
                {allTeachers.map(t => {
                  const tid = resolveId(t); const sel = teacherIds.includes(tid)
                  return (
                    <button key={tid} type="button" onClick={() => toggleTeacher(tid)}
                      className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all text-start",
                        sel ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted text-foreground")}>
                      <span className={cn("grid size-5 place-items-center rounded-md border text-[10px] font-bold shrink-0 transition-all",
                        sel ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                        {sel ? "✓" : ""}
                      </span>
                      <span className="grid size-7 place-items-center rounded-lg bg-violet-100 text-xs font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
                        {t.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{t.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{t.email}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {teacherIds.length > 0 && <p className="text-[10px] text-primary">تم اختيار {teacherIds.length} مدرس</p>}
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-border/60 px-5 py-4 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose}>إلغاء</Button>
          <Button className="flex-1 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
            onClick={handleSubmit} disabled={isPending}>
            <Plus className="size-4" />{isPending ? "جارٍ الإنشاء..." : "إنشاء المجموعة"}
          </Button>
        </div>
      </div>
    </div>
  )
}