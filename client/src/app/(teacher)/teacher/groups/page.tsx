import { TopBar } from "@/shared/components/layout/topbar"
import { Button } from "@/shared/components/ui/button"
import { serverFetch, resolveList } from "@/shared/lib/api-server"
import { getSessionData } from "@/shared/lib/session"
import { ApiGroup, ApiNotification, PaginatedResponse } from "@/shared/types/api"
import { BookOpen, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

const COLORS = [
  "from-violet-500 to-violet-600",
  "from-cyan-500 to-cyan-600",
  "from-amber-500 to-amber-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
]

export default async function TeacherGroupsPage() {
  const session = await getSessionData()

  const [groupsRes, notifsRes] = await Promise.allSettled([
    serverFetch<PaginatedResponse<ApiGroup>>("/api/teacher/groups?limit=50"),
    serverFetch<PaginatedResponse<ApiNotification>>("/api/notifications?limit=1"),
  ])

  const groups = resolveList(groupsRes as PromiseSettledResult<PaginatedResponse<ApiGroup> | ApiGroup[] | null>)
  const unread = resolveList(notifsRes as PromiseSettledResult<PaginatedResponse<ApiNotification> | ApiNotification[] | null>)
    .filter((n) => !n.isRead).length

  return (
    <div className="flex flex-col">
      <TopBar
        title="مجموعاتي"
        notifHref="/teacher/notifications"
        unreadCount={unread}
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{groups.length} مجموعات</p>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
            <BookOpen className="mb-3 size-10 text-muted-foreground/40" />
            <p className="font-medium">لا توجد مجموعات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">تواصل مع الإدارة لإنشاء مجموعتك الأولى</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((g, i) => (
              <div key={g.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className={`h-2 bg-gradient-to-r ${COLORS[i % COLORS.length]}`} />
                <div className="p-5">
                  <h3 className="text-base font-bold">{g.name}</h3>
                  {g.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{g.description}</p>
                  )}

                  <div className="mt-3 text-xs text-muted-foreground">
                    <span>آخر تحديث: {new Date(g.updatedAt).toLocaleDateString("ar-EG")}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/teacher/group/${g.id}/attendance`}>
                        <Users className="size-3.5" />تسجيل الحضور
                      </Link>
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-violet-600 to-violet-500 text-white hover:opacity-90" asChild>
                      <Link href={`/teacher/group/${g.id}`}>
                        <TrendingUp className="size-3.5" />إدارة المجموعة
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
