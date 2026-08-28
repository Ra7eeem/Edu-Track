import { NotifRowSkeleton, Skeleton } from "@/shared/components/ui/skeleton"

export default function JoinRequestsLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <Skeleton className="mb-5 h-11 w-full rounded-2xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <NotifRowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
