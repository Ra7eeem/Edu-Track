"use client"

import { ApiUser, resolveId } from "@/shared/types/api"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { ToggleTeacherButton } from "./toggle-teacher-button"
import { DeleteTeacherModal } from "./delete-teacher-modal"

export function TeacherList({ teachers }: { teachers: ApiUser[] }) {
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null)

  return (
    <>
      <p className="mb-3 text-xs text-muted-foreground">{teachers.length} مدرس</p>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        {teachers.map((t, i) => (
          <div
            key={resolveId(t)}
            className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 ${i < teachers.length - 1 ? "border-b border-border/40" : ""}`}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-violet-100 text-sm font-bold text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 shrink-0">
              {t.name[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.email}</p>
            </div>
            <span className={`hidden sm:inline-flex text-[10px] rounded-full px-2 py-0.5 font-medium ${
              t.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
            }`}>
              {t.isActive ? "نشط" : "غير نشط"}
            </span>
            {t.examsCount !== undefined && (
              <span className="hidden sm:inline-flex text-[10px] rounded-full px-2 py-0.5 font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {t.examsCount} امتحانات
              </span>
            )}
            <div className="flex gap-1.5 shrink-0">
              <ToggleTeacherButton id={resolveId(t)} isActive={t.isActive} />
              <button
                onClick={() => setDeleteTarget(t)}
                className="grid size-8 place-items-center rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors dark:border-rose-800 dark:hover:bg-rose-950/20"
                aria-label="حذف المدرس"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        {teachers.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">👨‍🏫</p>
            <p className="text-sm text-muted-foreground">لا يوجد مدرسون مطابقون</p>
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteTeacherModal target={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  )
}