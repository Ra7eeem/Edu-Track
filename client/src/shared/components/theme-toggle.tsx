"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { cn } from "@/shared/lib/tailwind-cn"

const emptySubscribe = () => () => {}

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-10 px-3.5 border border-border rounded flex items-center gap-2 text-sm text-muted-foreground",
          className
        )}
      >
        <span className="size-4" />
        {showLabel && <span>الوضع</span>}
      </div>
    )
  }

  const isDark = resolvedTheme === "dark"
  const themeName = isDark ? "ليل الزمرد" : "ورق المخطوطة"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "التبديل إلى وضع ورق المخطوطة" : "التبديل إلى وضع ليل الزمرد"}
      className={cn(
        "h-10 px-3.5 inline-flex items-center gap-2 border border-border rounded bg-transparent",
        "text-foreground text-sm font-medium hover:bg-muted transition-colors cursor-pointer",
        className
      )}
    >
      {isDark ? (
        <Moon className="size-4 text-accent" />
      ) : (
        <Sun className="size-4 text-accent" />
      )}
      {showLabel ? (
        <span>
          الوضع: <span className="font-semibold text-accent">{themeName}</span>
        </span>
      ) : (
        <span className="text-xs">{themeName}</span>
      )}
    </button>
  )
}
