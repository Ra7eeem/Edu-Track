import { Skeleton, StatCardSkeleton, PostCardSkeleton } from "@/shared/components/ui/skeleton"

export default function StudentDashboardLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-2xl space-y-5 p-4 sm:p-6">
        {/* Group banner */}
        <Skeleton className="h-32 w-full rounded-2xl" />
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        {/* Ranking preview */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < 4 ? "border-b border-border/40" : ""}`}>
                <Skeleton className="size-5 rounded shrink-0" />
                <Skeleton className="size-8 rounded-xl shrink-0" />
                <Skeleton className="flex-1 h-3.5" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
        {/* Posts */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-16" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
