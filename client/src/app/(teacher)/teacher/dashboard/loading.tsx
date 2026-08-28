import { Skeleton, StatCardSkeleton, CardSkeleton, ListRowSkeleton } from "@/shared/components/ui/skeleton"

export default function TeacherDashboardLoading() {
  return (
    <div className="flex flex-col">
      {/* TopBar skeleton */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>

        {/* Group cards */}
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>

        {/* Recent list */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={i < 4 ? "border-b border-border/40" : ""}>
              <ListRowSkeleton cols={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
