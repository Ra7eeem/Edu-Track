"use client"

import React from "react"
import { cn } from "@/shared/lib/tailwind-cn"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { Bell, Wifi, WifiOff } from "lucide-react"
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
  userName,
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
        <h1 className="truncate text-base font-bold">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Online indicator */}
        <span
          className={cn(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium sm:flex",
            online
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300"
          )}
        >
          {online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
          {online ? "متصل" : "بدون اتصال"}
        </span>

        {/* Custom actions slot */}
        {actions}

        {/* Theme toggle */}
        <ThemeToggle className="hidden sm:grid" />

        {/* Notifications */}
        <Link
          href={notifHref}
          className="relative grid size-9 place-items-center rounded-xl border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-all"
          aria-label="الإشعارات"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -end-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "٩+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Avatar */}
        <Link href={profileHref} aria-label="الحساب">
          <span
            className={cn(
              "grid size-9 place-items-center rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-80",
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
