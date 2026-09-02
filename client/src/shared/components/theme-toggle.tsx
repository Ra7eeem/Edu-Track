"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme }  from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/shared/lib/tailwind-cn"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <span className={cn("size-9 rounded-xl", className)} />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className={cn(
        "relative grid size-9 place-items-center rounded-xl",
        "text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
        className
      )}
    >
      <Sun
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        )}
      />
    </button>
  )
}
