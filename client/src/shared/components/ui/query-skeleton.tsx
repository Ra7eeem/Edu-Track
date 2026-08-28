"use client"

/**
 * Renders skeleton while React Query is loading,
 * error state if failed, or children when ready.
 */
interface Props {
  isLoading: boolean
  isError?:  boolean
  skeleton:  React.ReactNode
  children:  React.ReactNode
  errorMsg?: string
}

export function QuerySkeleton({ isLoading, isError, skeleton, children, errorMsg }: Props) {
  if (isLoading) return <>{skeleton}</>
  if (isError) return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive text-center">
      {errorMsg ?? "حدث خطأ أثناء تحميل البيانات. حاول مرة أخرى."}
    </div>
  )
  return <>{children}</>
}
