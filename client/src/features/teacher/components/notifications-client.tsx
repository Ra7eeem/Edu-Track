"use client"

import { Badge } from "@/shared/components/ui/badge"
import { useNotifications, useMarkAllRead } from "@/features/groups/hooks/use-notifications"
import { ApiNotification, NotificationType, PaginatedResponse } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  Bell,
  BookOpen,
  MessageCircle,
  UserPlus,
} from "lucide-react"

const iconMap: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  [NotificationType.NEW_POST]:              { icon: BookOpen,      color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
  [NotificationType.NEW_COMMENT]:           { icon: MessageCircle, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30"       },
  [NotificationType.NEW_REPLY]:             { icon: MessageCircle, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30"       },
  [NotificationType.JOIN_REQUEST_APPROVED]: { icon: UserPlus,      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"},
  [NotificationType.JOIN_REQUEST_REJECTED]: { icon: UserPlus,      color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30"       },
  [NotificationType.ADDED_TO_GROUP]:        { icon: BookOpen,      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30"    },
}

// initialData = the page's server-fetched list, so the client does NOT duplicate
// the request on mount (query stays fresh via useNotifications refetchInterval).
interface Props { initialData?: PaginatedResponse<ApiNotification> }

export function NotificationsClient({ initialData }: Props) {
  const { data }    = useNotifications({ initialData })
  const markAll     = useMarkAllRead()
  const notifs      = data?.data ?? []
  const unread      = notifs.filter((n) => !n.isRead).length

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold">الإشعارات</h2>
          {unread > 0 && (
            <Badge className="bg-primary text-primary-foreground text-[10px]">
              {unread} جديد
            </Badge>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={() => markAll.mutate()}
            className="text-xs text-primary hover:underline disabled:opacity-50"
            disabled={markAll.isPending}
          >
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="mb-3 size-10 text-muted-foreground/30" />
          <p className="font-medium">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const { icon: Icon, color } = iconMap[n.type] ?? { icon: Bell, color: "text-muted-foreground bg-muted" }
            return (
              <div
                key={n.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all",
                  !n.isRead ? "border-primary/20 bg-primary/5" : "border-border/60 bg-card"
                )}
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", color)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.isRead && (
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    {new Date(n.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
