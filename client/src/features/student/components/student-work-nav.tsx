import { cn } from "@/shared/lib/tailwind-cn"
import { ApiGroup, resolveId } from "@/shared/types/api"
import Link from "next/link"

export function StudentWorkNav({
  active,
  groups,
  groupId,
}: {
  active:  "homework" | "exams"
  groups:  ApiGroup[]
  groupId: string
}) {
  const qs = groupId ? `?group=${groupId}` : ""

  return (
    <div className="space-y-3">
      <div className="flex gap-1 rounded-2xl border border-border/60 bg-card p-1">
        <Link
          href={`/student/assignments${qs}`}
          className={cn(
            "flex-1 rounded-xl px-3 py-2 text-center text-xs font-medium transition-all",
            active === "homework" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          الواجبات
        </Link>
        <Link
          href={`/student/exams${qs}`}
          className={cn(
            "flex-1 rounded-xl px-3 py-2 text-center text-xs font-medium transition-all",
            active === "exams" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          الامتحانات
        </Link>
      </div>

      {groups.length > 1 && (
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border/60 bg-card p-1">
          {groups.map((group) => {
            const gid = resolveId(group)
            const href = active === "exams"
              ? `/student/exams?group=${gid}`
              : `/student/assignments?group=${gid}`
            return (
              <Link
                key={gid}
                href={href}
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-all",
                  groupId === gid ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {group.name}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
