"use client"

import { TopBar }              from "@/shared/components/layout/topbar"
import { Badge }               from "@/shared/components/ui/badge"
import { Button }              from "@/shared/components/ui/button"
import { NotifRowSkeleton }    from "@/shared/components/ui/skeleton"
import {
  useApproveJoinRequest,
  useJoinRequests,
  useRejectJoinRequest,
} from "@/features/teacher/hooks/use-join-requests"
import {
  resolveId,
  JoinRequestStatus,
  GRADE_LABELS,
  type ApiJoinRequest,
} from "@/shared/types/api"
import { cn }                  from "@/shared/lib/tailwind-cn"
import { CheckCircle2, Clock, UserCheck, UserX, XCircle } from "lucide-react"
import { useState }            from "react"

const STATUS_FILTERS = [
  { value: undefined,                   label: "الكل"        },
  { value: JoinRequestStatus.PENDING,   label: "في الانتظار" },
  { value: JoinRequestStatus.APPROVED,  label: "مقبول"       },
  { value: JoinRequestStatus.REJECTED,  label: "مرفوض"       },
] as const

// ── helpers ────────────────────────────────────────────────────────────────────
function getName(req: ApiJoinRequest)  {
  return (req.student as { name?:  string } | undefined)?.name  ?? "طالب"
}
function getEmail(req: ApiJoinRequest) {
  return (req.student as { email?: string } | undefined)?.email ?? ""
}
function getGroup(req: ApiJoinRequest) {
  return (req.group   as { name?:  string } | undefined)?.name  ?? req.groupId
}
function getGrade(req: ApiJoinRequest) {
  const grade = (req.student as { grade?: string } | undefined)?.grade
  return grade ? GRADE_LABELS[grade as keyof typeof GRADE_LABELS] : ""
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface JoinRequestsClientProps {
  initialRequests: ApiJoinRequest[]
  initialPending:  number
  userName:        string
}

export function JoinRequestsClient({
  initialRequests,
  initialPending,
  userName,
}: JoinRequestsClientProps) {
  const [filter, setFilter] = useState<JoinRequestStatus | undefined>(
    JoinRequestStatus.PENDING
  )

  const { data: requests = [], isLoading, isError, refetch } = useJoinRequests(filter, {
    // seed cache with SSR data only for the initial PENDING filter
    initialData: filter === JoinRequestStatus.PENDING ? initialRequests : undefined,
  })

  const approveMut = useApproveJoinRequest()
  const rejectMut  = useRejectJoinRequest()

  const pending = filter === JoinRequestStatus.PENDING
    ? requests.filter(r => r.status === JoinRequestStatus.PENDING).length
    : initialPending

  return (
    <div className="flex flex-col">
      <TopBar
        title="طلبات الانضمام"
        subtitle={pending > 0 ? `${pending} طلب في الانتظار` : "لا توجد طلبات جديدة"}
        notifHref="/teacher/notifications"
        unreadCount={pending}
        userName={userName}
        userAvatar={userName ? userName[0] : "م"}
        userAvatarColor="bg-violet-500"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        {/* Filter tabs */}
        <div className="mb-5 flex gap-1 rounded-2xl border border-input bg-muted/40 p-1.5">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={String(value)}
              onClick={() => setFilter(value)}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-medium transition-all",
                filter === value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error */}
        {isError && (
          <div className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-center text-sm text-destructive">
            حدث خطأ أثناء تحميل البيانات.{" "}
            <button onClick={() => refetch()} className="underline">
              حاول مجدداً
            </button>
          </div>
        )}

        {/* Loading — only when no cached data */}
        {isLoading && requests.length === 0 && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <NotifRowSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && requests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="mb-3 text-5xl">
              {filter === JoinRequestStatus.PENDING ? "📭" : "✅"}
            </span>
            <p className="font-medium">
              {filter === JoinRequestStatus.PENDING
                ? "لا توجد طلبات في الانتظار"
                : "لا توجد طلبات"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === JoinRequestStatus.PENDING
                ? "سيظهر هنا طلبات الانضمام الجديدة من الطلاب"
                : "جرّب فلتراً مختلفاً"}
            </p>
          </div>
        )}

        {/* List */}
        {requests.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{requests.length} طلب</p>

            {requests.map((req: ApiJoinRequest) => {
              const rid        = resolveId(req)
              const isPending  = req.status === JoinRequestStatus.PENDING
              const isApproved = req.status === JoinRequestStatus.APPROVED

              return (
                <div
                  key={rid}
                  className={cn(
                    "rounded-2xl border bg-card p-4 shadow-sm transition-all",
                    isPending
                      ? "border-amber-200/60 bg-amber-50/20 dark:border-amber-800/30 dark:bg-amber-950/10"
                      : isApproved
                      ? "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-800/30 dark:bg-emerald-950/10"
                      : "border-rose-200/60 bg-rose-50/20 dark:border-rose-800/30 dark:bg-rose-950/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-white",
                        isPending
                          ? "bg-amber-500"
                          : isApproved
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      )}
                    >
                      {getName(req)[0]}
                    </span>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold">{getName(req)}</p>
                        <Badge
                          className={cn(
                            "border-0 text-[10px]",
                            isPending
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : isApproved
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          )}
                        >
                          {isPending ? (
                            <><Clock className="me-1 size-2.5" />في الانتظار</>
                          ) : isApproved ? (
                            <><CheckCircle2 className="me-1 size-2.5" />مقبول</>
                          ) : (
                            <><XCircle className="me-1 size-2.5" />مرفوض</>
                          )}
                        </Badge>
                      </div>

                      {getEmail(req) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{getEmail(req)}</p>
                      )}

                      <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {getGroup(req) && <span>📚 {getGroup(req)}</span>}
                        {getGrade(req) && <span>🎓 {getGrade(req)}</span>}
                        <span>🕐 {new Date(req.createdAt).toLocaleDateString("ar-EG")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions — pending only */}
                  {isPending && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                        disabled={approveMut.isPending}
                        onClick={() => approveMut.mutate(rid)}
                      >
                        <UserCheck className="size-3.5" />
                        {approveMut.isPending ? "جارٍ القبول..." : "قبول"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20"
                        disabled={rejectMut.isPending}
                        onClick={() => {
                          if (!confirm(`رفض طلب ${getName(req)}؟`)) return
                          rejectMut.mutate(rid)
                        }}
                      >
                        <UserX className="size-3.5" />
                        {rejectMut.isPending ? "جارٍ الرفض..." : "رفض"}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
