"use client"

import { useState } from "react"
import { Badge } from "@/shared/components/ui/badge"
import { useNotifications, useMarkAllRead } from "@/features/groups/hooks/use-notifications"
import { ApiNotification, NotificationType, PaginatedResponse } from "@/shared/types/api"
import { cn } from "@/shared/lib/tailwind-cn"
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileText,
  HelpCircle,
  MessageCircle,
  UserPlus,
  Award,
} from "lucide-react"

const iconMap: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  [NotificationType.NEW_POST]:              { icon: BookOpen,      color: "text-primary bg-primary/10 dark:bg-primary/20" },
  [NotificationType.NEW_COMMENT]:           { icon: MessageCircle, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
  [NotificationType.NEW_REPLY]:             { icon: MessageCircle, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
  [NotificationType.JOIN_REQUEST_APPROVED]: { icon: UserPlus,      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  [NotificationType.JOIN_REQUEST_REJECTED]: { icon: UserPlus,      color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30" },
  [NotificationType.ADDED_TO_GROUP]:        { icon: BookOpen,      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  [NotificationType.NEW_EXAM]:              { icon: Award,         color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  [NotificationType.ATTENDANCE_RECORDED]:   { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
  [NotificationType.QUESTION_REPLIED]:      { icon: HelpCircle,    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30" },
  [NotificationType.LESSON_REMINDER]:       { icon: BookOpen,      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  [NotificationType.TASK_REMINDER]:         { icon: Bell,          color: "text-primary bg-primary/10 dark:bg-primary/20" },
}

type FilterCategory = "ALL" | "EXAM" | "ATTENDANCE" | "POST" | "REPLY"

const FILTER_TABS: { key: FilterCategory; label: string; icon: React.ElementType }[] = [
  { key: "ALL",        label: "الكل",          icon: Bell          },
  { key: "EXAM",       label: "الامتحانات",     icon: Award         },
  { key: "ATTENDANCE", label: "الحضور",         icon: CalendarCheck },
  { key: "POST",       label: "المنشورات",      icon: BookOpen      },
  { key: "REPLY",      label: "الردود",         icon: MessageCircle },
]

interface Props { initialData?: PaginatedResponse<ApiNotification> }

export function NotificationsClient({ initialData }: Props) {
  const { data } = useNotifications({ initialData })
  const markAll = useMarkAllRead()
  const notifs = Array.isArray(data) ? data : (data?.data ?? [])
  const unread = notifs.filter((n) => !n.isRead).length

  const [filter, setFilter] = useState<FilterCategory>("ALL")

  const filteredNotifs = notifs.filter((n) => {
    if (filter === "ALL") return true
    if (filter === "EXAM") return n.type === NotificationType.NEW_EXAM
    if (filter === "ATTENDANCE") return n.type === NotificationType.ATTENDANCE_RECORDED
    if (filter === "POST") return n.type === NotificationType.NEW_POST
    if (filter === "REPLY")
      return (
        n.type === NotificationType.QUESTION_REPLIED ||
        n.type === NotificationType.NEW_REPLY ||
        n.type === NotificationType.NEW_COMMENT
      )
    return true
  })

  return (
    <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-heading">صندوق الإشعارات</h2>
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

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = filter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-border/70 bg-card/50">
          <Bell className="mb-3 size-10 text-muted-foreground/30" />
          <p className="font-medium text-heading">لا توجد إشعارات في هذا القسم</p>
          <p className="text-xs text-muted-foreground mt-1">
            ستصلك التحديثات الفورية عند إضافة مهام أو امتحانات أو تسجيل حضور.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifs.map((n) => {
            const { icon: Icon, color } =
              iconMap[n.type as NotificationType] ?? { icon: Bell, color: "text-muted-foreground bg-muted" }
            return (
              <div
                key={n.id || n._id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all",
                  !n.isRead
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border/60 bg-card"
                )}
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", color)}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {!n.isRead && (
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    {new Date(n.createdAt).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
