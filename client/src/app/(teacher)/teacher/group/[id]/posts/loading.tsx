import { PostCardSkeleton, Skeleton } from "@/shared/components/ui/skeleton"

export default function PostsLoading() {
  return (
    <div className="flex flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2"><Skeleton className="size-9 rounded-xl" /><Skeleton className="size-9 rounded-xl" /></div>
      </div>
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
        <Skeleton className="h-12 w-full rounded-2xl" />
        {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
      </div>
    </div>
  )
}
