import { Skeleton, CardSkeleton } from "@/shared/components/ui/skeleton"

export default function TeacherGroupsLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="size-9 rounded-xl" />
          <Skeleton className="size-9 rounded-xl" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <Skeleton className="mb-4 h-3 w-20" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
