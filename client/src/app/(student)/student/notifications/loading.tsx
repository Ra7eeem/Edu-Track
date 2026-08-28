import { Skeleton, NotifRowSkeleton } from "@/shared/components/ui/skeleton"

export default function StudentNotificationsLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2"><Skeleton className="size-9 rounded-xl" /><Skeleton className="size-9 rounded-xl" /></div>
      </div>
      <div className="mx-auto w-full max-w-lg p-4 sm:p-6 space-y-2">
        <div className="mb-4 flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => <NotifRowSkeleton key={i} />)}
      </div>
    </div>
  )
}
