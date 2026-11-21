"use client"

import { useQuery } from "@tanstack/react-query"
import { clientFetch } from "@/shared/lib/api-client"
import { ApiNotification } from "@/shared/types/api"
import { Bell } from "lucide-react"
import Link from "next/link"

interface Props {
  notifHref: string
  initialUnreadCount?: number
}

export function TopBarNotificationBell({ notifHref, initialUnreadCount = 0 }: Props) {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await clientFetch<{
          data: ApiNotification[]
          unreadCount?: number
        }>("/api/notifications?limit=50")
        const list = Array.isArray(res) ? res : res?.data ?? []
        const count = res?.unreadCount ?? list.filter((n) => !n.isRead).length
        return { list, count }
      } catch {
        return null
      }
    },
    staleTime: 10 * 1000,
  })

  const unreadCount = data ? data.count : initialUnreadCount

  return (
    <Link
      href={notifHref}
      className="relative grid size-9 place-items-center rounded border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
      aria-label="الإشعارات"
    >
      <Bell className="size-4" />
      {unreadCount > 0 && (
        <span className="absolute -end-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-card">
          {unreadCount > 9 ? "٩+" : unreadCount}
        </span>
      )}
    </Link>
  )
}
