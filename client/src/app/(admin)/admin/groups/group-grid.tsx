"use client"

import { ApiGroup, GRADE_LABELS, resolveId } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { DeleteGroupModal } from "./delete-group-modal"
import { Button } from "@/shared/components/ui/button"

const COLORS = [
  "from-violet-500 to-violet-600", "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",   "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

export function GroupGrid({ groups }: { groups: ApiGroup[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  return (
    <>
      <p className="mb-4 text-xs text-muted-foreground">{groups.length} مجموعة</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <div
            key={resolveId(g)}
            className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
          >
            <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
            <div className="p-4">
              <h3 className="text-sm font-bold leading-snug">{g.name}</h3>
              {g.description && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
              )}
              {(g.grades ?? []).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {g.grades.map(gr => (
                    <span key={gr} className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                      {GRADE_LABELS[gr]}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{new Date(g.createdAt).toLocaleDateString("ar-EG")}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setDeleteId(resolveId(g))}
                    className="grid size-6 place-items-center rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20"
                    aria-label="حذف المجموعة"
                  >
                    <Trash2 className="size-3" />
                  </button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                    <Link href={`/admin/group/${resolveId(g)}`}>تفاصيل</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-sm text-muted-foreground">لا توجد مجموعات بعد</p>
          </div>
        )}
      </div>

      {deleteId && (
        <DeleteGroupModal groupId={deleteId} onClose={() => setDeleteId(null)} />
      )}
    </>
  )
}