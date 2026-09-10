"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function TeacherSearch({ initial }: { initial: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initial)

  const onChange = (term: string) => {
    setValue(term)
    const params = new URLSearchParams(searchParams.toString())
    if (term.trim()) params.set("q", term.trim())
    else params.delete("q")
    router.replace(`/admin/teachers?${params.toString()}`)
  }

  return (
    <div className="relative flex-1 min-w-48">
      <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="بحث بالاسم أو البريد..."
        className="flex h-10 w-full rounded-2xl border border-input bg-card ps-10 pe-4 text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/20 transition-all"
      />
    </div>
  )
}