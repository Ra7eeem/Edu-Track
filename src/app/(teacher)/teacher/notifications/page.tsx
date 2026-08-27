import { TopBar } from "@/shared/components/layout/topbar"
import { Badge } from "@/shared/components/ui/badge"
import { currentTeacher, mockNotifications } from "@/shared/data/mock"
import { cn } from "@/shared/lib/tailwind-cn"
import { Bell, BookOpen, CalendarCheck, MessageCircle, Trophy } from "lucide-react"

const notifs = mockNotifications.filter(n => n.userId === currentTeacher.id)
const unread = notifs.filter(n => !n.read).length

const iconMap = {
  post:         { icon: BookOpen,      color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30" },
  comment:      { icon: MessageCircle, color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30"       },
  attendance:   { icon: CalendarCheck, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30"},
  ranking:      { icon: Trophy,        color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30"    },
  announcement: { icon: Bell,          color: "text-rose-600 bg-rose-100 dark:bg-rose-900/30"       },
}

export default function TeacherNotificationsPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="الإشعارات"
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={currentTeacher.name}
        userAvatar={currentTeacher.avatar}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">الإشعارات</h2>
            {unread > 0 && <Badge className="bg-primary text-primary-foreground text-[10px]">{unread} جديد</Badge>}
          </div>
          <button className="text-xs text-primary hover:underline">تحديد الكل كمقروء</button>
        </div>

        {notifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bell className="mb-3 size-10 text-muted-foreground/30"/>
            <p className="font-medium">لا توجد إشعارات</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map(n => {
              const { icon: Icon, color } = iconMap[n.type]
              return (
                <div key={n.id} className={cn(
                  "flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all",
                  !n.read ? "border-primary/20 bg-primary/5" : "border-border/60 bg-card"
                )}>
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", color)}>
                    <Icon className="size-4"/>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && <span className="size-1.5 rounded-full bg-primary shrink-0"/>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">{n.createdAt}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
