import { Skeleton, RankRowSkeleton } from "@/shared/components/ui/skeleton"

export default function StudentRankingLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2"><Skeleton className="size-9 rounded-xl" /><Skeleton className="size-9 rounded-xl" /></div>
      </div>
      <div className="mx-auto w-full max-w-lg p-4 sm:p-6">
        <Skeleton className="mx-auto mb-1 h-5 w-48" />
        <Skeleton className="mx-auto mb-6 h-3 w-32" />
        <div className="mb-6 grid grid-cols-3 gap-2 rounded-3xl border border-amber-200/40 bg-amber-50/30 dark:bg-amber-950/10 p-4">
          {[80, 112, 64].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="size-7 rounded-full" />
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="w-full rounded-t-xl" style={{ height: h }} />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <RankRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
