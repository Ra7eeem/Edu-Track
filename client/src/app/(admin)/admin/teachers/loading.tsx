import { Skeleton, ListRowSkeleton } from "@/shared/components/ui/skeleton"

export default function AdminTeachersLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2"><Skeleton className="size-9 rounded-xl" /><Skeleton className="size-9 rounded-xl" /></div>
      </div>
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <Skeleton className="mb-3 h-3 w-16" />
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
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
