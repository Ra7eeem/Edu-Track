import { HomeworkCard } from "@/features/student/components/student-work-cards"
import { StudentWorkNav } from "@/features/student/components/student-work-nav"
import { loadStudentWork } from "@/features/student/lib/load-student-work"
import { TopBar } from "@/shared/components/layout/topbar"
import { getSessionData } from "@/shared/lib/session"
import { AssignmentType, resolveId } from "@/shared/types/api"

export default async function StudentAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const session = await getSessionData()
  const { group } = await searchParams
  const { groups, activeGroupId, assignments } = await loadStudentWork(group, AssignmentType.HOMEWORK)

  const now      = new Date()
  const upcoming = assignments.filter((a) => !a.dueDate || new Date(a.dueDate) >= now)
  const past     = assignments.filter((a) => a.dueDate && new Date(a.dueDate) < now)
  const name     = session?.name ?? ""

  return (
    <div className="flex flex-col">
      <TopBar
        title="الواجبات"
        notifHref="/student/notifications"
        userName={name}
        userAvatar={name[0] ?? "أ"}
        userAvatarColor="bg-teal-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
        <StudentWorkNav active="homework" groups={groups} groupId={activeGroupId} />

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-medium">لا توجد واجبات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">سيضيف مدرسك الواجبات هنا</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">القادمة ({upcoming.length})</h3>
                <div className="space-y-3">
                  {upcoming.map((a) => (
                    <HomeworkCard key={resolveId(a)} assignment={a} />
                  ))}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground/60 uppercase">المنتهية ({past.length})</h3>
                <div className="space-y-3 opacity-75">
                  {past.map((a) => (
                    <HomeworkCard key={resolveId(a)} assignment={a} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
