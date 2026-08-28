import { Skeleton } from "@/shared/components/ui/skeleton"

export default function AttendanceLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-border/60 bg-card px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-3">
        <Skeleton className="h-10 w-full rounded-2xl" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
            <Skeleton className="size-9 rounded-xl shrink-0" />
            <Skeleton className="flex-1 h-4" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-14 rounded-xl" />
              <Skeleton className="h-8 w-14 rounded-xl" />
            </div>
          </div>
        ))}
        <Skeleton className="mt-4 h-11 w-full rounded-2xl" />
      </div>
    </div>
  )
}
