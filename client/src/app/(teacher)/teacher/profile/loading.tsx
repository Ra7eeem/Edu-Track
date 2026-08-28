import { Skeleton } from "@/shared/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2"><Skeleton className="size-9 rounded-xl" /><Skeleton className="size-9 rounded-xl" /></div>
      </div>
      <div className="mx-auto w-full max-w-xl p-4 sm:p-6 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-20 rounded-3xl" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-28" />
        </div>
        {/* Form card */}
        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-10 w-full rounded-2xl" />
      </div>
    </div>
  )
}
