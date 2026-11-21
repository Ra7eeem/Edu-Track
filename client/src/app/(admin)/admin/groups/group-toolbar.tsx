"use client"

import { Plus, Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { CreateGroupModal } from "./create-group-modal"

export function GroupToolbar({
  initial,
  allTeachers,
}: {
  initial: string
  allTeachers: { id?: string; _id?: string; name: string; email: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // URL-driven search hits the API per navigation, so debounce keystrokes
  const onChange = (term: string) => {
    setValue(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (term.trim()) params.set("q", term.trim())
      else params.delete("q")
      router.replace(`/admin/groups?${params.toString()}`)
    }, 350)
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  return (
    <>
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="بحث عن مجموعة..."
            className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">إنشاء مجموعة</span>
        </button>
      </div>

      {showCreate && (
        <CreateGroupModal
          allTeachers={allTeachers}
          onClose={() => setShowCreate(false)}
        />
      )}
    </>
  )
}
