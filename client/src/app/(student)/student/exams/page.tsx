import { RefreshOnInterval } from "@/features/student/components/refresh-on-interval"
import { ExamListCard } from "@/features/student/components/student-work-cards"
import { StudentWorkNav } from "@/features/student/components/student-work-nav"
import { loadStudentWork } from "@/features/student/lib/load-student-work"
import { TopBar } from "@/shared/components/layout/topbar"
import { getSessionData } from "@/shared/lib/session"
import { AssignmentType, resolveId } from "@/shared/types/api"

export default async function StudentExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>
}) {
  const session = await getSessionData()
  const { group } = await searchParams
  const { groups, activeGroupId, assignments } = await loadStudentWork(group, AssignmentType.EXAM)
  const name = session?.name ?? ""

  return (
    <div className="flex flex-col">
      <RefreshOnInterval seconds={5} />
      <TopBar
        title="الامتحانات"
        notifHref="/student/notifications"
        userName={name}
        userAvatar={name[0] ?? "أ"}
        userAvatarColor="bg-teal-500"
        profileHref="/student/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 space-y-4">
        <StudentWorkNav active="exams" groups={groups} groupId={activeGroupId} />

        {assignments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="font-medium">لا توجد امتحانات بعد</p>
            <p className="mt-1 text-sm text-muted-foreground">سيضيف مدرسك الامتحانات هنا</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <ExamListCard key={resolveId(a)} assignment={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
