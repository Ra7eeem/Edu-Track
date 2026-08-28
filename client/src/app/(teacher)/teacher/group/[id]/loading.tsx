import { Skeleton, StatCardSkeleton, ListRowSkeleton } from "@/shared/components/ui/skeleton"

export default function GroupManageLoading() {
  return (
    <div className="flex flex-col">
      {/* TopBar */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>

      {/* Group header actions */}
      <div className="border-b border-border/60 bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-8 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/60 bg-background px-4 py-2 sm:px-6">
        <div className="mx-auto max-w-5xl flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={i < 5 ? "border-b border-border/40" : ""}>
              <ListRowSkeleton cols={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
