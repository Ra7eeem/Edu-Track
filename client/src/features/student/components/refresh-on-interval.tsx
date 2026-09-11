"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Re-renders the current Server Component so teacher result visibility updates
 * without a manual refresh.
 *
 * Polling only runs while the tab is visible and defer the first refresh until
 * the interval passes so hidden tabs do not hammer the backend with refreshes.
 */
export function RefreshOnInterval({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter()

  useEffect(() => {
    if (document.visibilityState !== "visible") return

    let id: ReturnType<typeof setInterval> | null = null
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && id === null) {
        id = setInterval(() => router.refresh(), seconds * 1000)
      } else if (document.visibilityState === "hidden" && id !== null) {
        clearInterval(id)
        id = null
      }
    }

    id = setInterval(() => router.refresh(), seconds * 1000)
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => {
      if (id !== null) clearInterval(id)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [router, seconds])

  return null
}
