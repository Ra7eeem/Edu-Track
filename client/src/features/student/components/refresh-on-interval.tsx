"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/** Re-renders the current Server Component so teacher result visibility updates without a manual refresh. */
export function RefreshOnInterval({ seconds }: { seconds: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000)
    return () => clearInterval(id)
  }, [router, seconds])

  return null
}
