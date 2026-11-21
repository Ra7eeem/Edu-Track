import React from "react"
import { cn } from "@/shared/lib/tailwind-cn"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { TopBarNotificationBell } from "./topbar-notification-bell"
import { Wifi, WifiOff } from "lucide-react"
import Link from "next/link"

interface TopBarProps {
  title: string
  subtitle?: string
  notifHref: string
  unreadCount?: number
  userName: string
  userAvatar: string
  userAvatarColor: string
  profileHref: string
  online?: boolean
  className?: string
  actions?: React.ReactNode
}

export function TopBar({
  title,
  subtitle,
  notifHref,
  unreadCount = 0,
  userAvatar,
  userAvatarColor,
  profileHref,
  online = true,
  className,
  actions,
}: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6",
        className
      )}
    >
      {/* Title */}
      <div className="min-w-0">
        <h1 className="truncate font-display text-lg font-bold text-heading">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Online indicator */}
        <span
          className={cn(
            "hidden items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium sm:flex",
            online
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          )}
        >
          {online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
          {online ? "متصل" : "بدون اتصال"}
        </span>

        {/* Custom actions slot */}
        {actions}

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <TopBarNotificationBell
          notifHref={notifHref}
          initialUnreadCount={unreadCount}
        />

        {/* Avatar */}
        <Link href={profileHref} aria-label="الحساب">
          <span
            className={cn(
              "grid size-9 place-items-center rounded text-sm font-bold transition-opacity hover:opacity-80 bg-primary text-primary-foreground",
              userAvatarColor
            )}
          >
            {userAvatar}
          </span>
        </Link>
      </div>
    </header>
  )
}
