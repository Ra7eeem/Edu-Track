import { Grade, GRADE_LABELS } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"

interface GradesSelectorProps {
  selected: Grade[]
  onChange: (g: Grade[]) => void
}

// Shared multi-select for a group's allowed grades (empty selection = open to all grades).
// Extracted so create & edit group forms reuse the exact same UI/logic.
export function GradesSelector({ selected, onChange }: GradesSelectorProps) {
  const toggle = (g: Grade) =>
    onChange(selected.includes(g) ? selected.filter(x => x !== g) : [...selected, g])

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        الصفوف المتاحة
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