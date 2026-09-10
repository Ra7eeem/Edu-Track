"use client"

import { useTransition } from "react"
import { toggleTeacherStatusAction } from "@/features/admin/actions/teacher.action"

export function ToggleTeacherButton({
  id,
  isActive,
}: {
  id: string
  isActive: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(async () => {
        await toggleTeacherStatusAction(id, !isActive)
      })}
      disabled={isPending}
      className="rounded-xl px-2.5 py-1.5 text-xs text-primary border border-primary/20 hover:bg-primary/5 transition-colors disabled:opacity-40"
    >
      {isPending ? "..." : isActive ? "تعطيل" : "تفعيل"}
    </button>
  )
}