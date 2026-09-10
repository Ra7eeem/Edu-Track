"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { AddTeacherModal } from "./add-teacher-modal"

export function ModalManager({ addButtonLabel }: { addButtonLabel: string }) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <>
      <Button
        size="sm"
        className="shrink-0 bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90"
        onClick={() => setShowAdd(true)}
      >
        <UserPlus className="size-3.5" />
        {addButtonLabel}
      </Button>
      {showAdd && <AddTeacherModal onClose={() => setShowAdd(false)} />}
    </>
  )
}