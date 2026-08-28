import { cn } from "@/shared/lib/tailwind-cn"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** rounded pill shape */
  pill?: boolean
  /** full circle avatar */
  circle?: boolean
}

export function Skeleton({ className, pill, circle, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-muted",
        circle ? "rounded-full" : pill ? "rounded-full" : "rounded-xl",
        className
      )}
      {...props}
    />
  )
}

// ─── Compound blocks ──────────────────────────────────────────────────────────

/** A single stat card skeleton */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-3">
      <Skeleton className="size-9 rounded-xl" />
      <Skeleton className="h-7 w-14" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

/** A list-row skeleton */
export function ListRowSkeleton({ cols = 3 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <Skeleton className="size-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-2.5 w-28" />
      </div>
      {cols >= 3 && <Skeleton className="h-5 w-12 rounded-full" />}
      {cols >= 4 && <Skeleton className="h-7 w-16 rounded-xl" />}
    </div>
  )
}

/** A card skeleton */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Skeleton className="h-2 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1 rounded-xl" />
          <Skeleton className="h-8 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/** A post card skeleton */
export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-9 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

/** A ranking row skeleton */
export function RankRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3">
      <Skeleton className="size-6 rounded-lg shrink-0" />
      <Skeleton className="size-8 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-1.5 w-full rounded-full" />
      </div>
      <Skeleton className="h-4 w-8" />
    </div>
  )
}

/** Notification row skeleton */
export function NotifRowSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
      <Skeleton className="size-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-52" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  )
}
