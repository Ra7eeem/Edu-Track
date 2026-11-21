"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import { playWhatsAppSound, unlockAudio } from "@/shared/lib/audio"
import {
  ApiNotification,
  NotificationType,
  resolveId,
} from "@/shared/types/api"
import {
  Bell,
  BookOpen,
  CalendarCheck,
  Award,
  HelpCircle,
  MessageCircle,
  X,
  Volume2,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const iconMap: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  [NotificationType.NEW_POST]: {
    icon: BookOpen,
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
  [NotificationType.NEW_COMMENT]: {
    icon: MessageCircle,
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/15 border-cyan-500/30",
  },
  [NotificationType.NEW_REPLY]: {
    icon: MessageCircle,
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/15 border-cyan-500/30",
  },
  [NotificationType.JOIN_REQUEST_APPROVED]: {
    icon: Bell,
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
  [NotificationType.JOIN_REQUEST_REJECTED]: {
    icon: Bell,
    color: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-500/15 border-rose-500/30",
  },
  [NotificationType.ADDED_TO_GROUP]: {
    icon: BookOpen,
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  [NotificationType.NEW_EXAM]: {
    icon: Award,
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/15 border-amber-500/30",
  },
  [NotificationType.ATTENDANCE_RECORDED]: {
    icon: CalendarCheck,
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/15 border-emerald-500/30",
  },
  [NotificationType.QUESTION_REPLIED]: {
    icon: HelpCircle,
    color: "text-cyan-700 dark:text-cyan-300",
    bg: "bg-cyan-500/15 border-cyan-500/30",
  },
}

export function NotificationBannerListener() {
  const qc = useQueryClient()
  const [activeBanner, setActiveBanner] = useState<ApiNotification | null>(null)
  const isInitialMount = useRef(true)
  const knownNotificationIds = useRef<Set<string>>(new Set())

  // Fast background polling every 7 seconds for live updates
  const { data } = useQuery({
    queryKey: ["notifications-live-feed"],
    queryFn: async () => {
      try {
        const res = await clientFetch<{
          data: ApiNotification[]
          unreadCount?: number
        }>("/api/notifications?limit=15")
        const list = Array.isArray(res) ? res : res?.data ?? []
        return list
      } catch {
        return []
      }
    },
    refetchInterval: 7000,
    refetchIntervalInBackground: false,
    staleTime: 5000,
  })

  useEffect(() => {
    if (!data || data.length === 0) return

    if (isInitialMount.current) {
      // Seed known notifications without playing audio on page load
      data.forEach((n) => {
        const id = resolveId(n)
        if (id) knownNotificationIds.current.add(id)
      })
      isInitialMount.current = false
      return
    }

    // Check for any newly arrived unread notifications
    const newUnreadNotifs = data.filter((n) => {
      const id = resolveId(n)
      return id && !n.isRead && !knownNotificationIds.current.has(id)
    })

    // Record all IDs to prevent re-triggering
    data.forEach((n) => {
      const id = resolveId(n)
      if (id) knownNotificationIds.current.add(id)
    })

    if (newUnreadNotifs.length > 0) {
      const latest = newUnreadNotifs[0]
      // 🔊 Play WhatsApp-style notification sound!
      playWhatsAppSound()

      // Show top WhatsApp-style toast
      setActiveBanner(latest)

      // Invalidate general notification queries so badges update
      qc.invalidateQueries({ queryKey: ["notifications"] })
    }
  }, [data, qc])

  // Auto-dismiss banner after 6 seconds
  useEffect(() => {
    if (!activeBanner) return
    const timer = setTimeout(() => {
      setActiveBanner(null)
    }, 6000)
    return () => clearTimeout(timer)
  }, [activeBanner])

  if (!activeBanner) return null

  const cfg = iconMap[activeBanner.type] || {
    icon: Bell,
    color: "text-primary",
    bg: "bg-primary/15 border-primary/30",
  }
  const Icon = cfg.icon

  return (
    <div className="fixed top-4 end-4 start-4 sm:start-auto sm:w-96 z-50 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-card p-4 shadow-2xl backdrop-blur-md ring-2 ring-emerald-500/20 font-sans">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl border ${cfg.bg} ${cfg.color}`}
        >
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <Volume2 className="size-3 animate-pulse" />
              إشعار جديد
            </span>
            <button
              onClick={() => setActiveBanner(null)}
              className="grid size-6 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <h4 className="font-display text-sm font-bold text-heading mt-0.5 truncate">
            {activeBanner.title}
          </h4>

          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {activeBanner.message}
          </p>

          <div className="mt-2.5 flex items-center justify-end">
            <Link
              href="/student/notifications"
              onClick={() => setActiveBanner(null)}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              عرض الإشعار
              <ExternalLink className="size-3 ms-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
