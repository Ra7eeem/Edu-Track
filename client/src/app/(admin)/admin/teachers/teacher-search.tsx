"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function TeacherSearch({ initial }: { initial: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(initial)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // URL-driven search hits the API per navigation, so debounce keystrokes
  const onChange = (term: string) => {
    setValue(term)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (term.trim()) params.set("q", term.trim())
      else params.delete("q")
      router.replace(`/admin/teachers?${params.toString()}`)
    }, 350)
  }

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

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