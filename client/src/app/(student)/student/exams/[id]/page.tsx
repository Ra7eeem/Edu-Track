import { ExamTaker } from "@/features/student/components/exam-taker"
import { getExamAvailability } from "@/features/student/lib/exam-availability"
import { Button } from "@/shared/components/ui/button"
import { ApiServerError, serverFetch } from "@/shared/lib/api-server"
import { ApiAssignment, AssignmentType, resolveId } from "@/shared/types/api"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function TakeExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let assignment: ApiAssignment
  try {
    assignment = await serverFetch<ApiAssignment>(`/api/assignments/${id}`)
  } catch (e) {
    const notFound = e instanceof ApiServerError && (e.status === 404 || e.status === 403)
    return (
      <div className="mx-auto w-full max-w-md p-6 text-center space-y-4">
        <p className="text-4xl">📝</p>
        <p className="font-medium">{notFound ? "الامتحان غير متاح" : "تعذر تحميل الامتحان"}</p>
        <Button asChild variant="outline">
          <Link href="/student/exams">العودة إلى الامتحانات</Link>
        </Button>
      </div>
    )
  }

  if (assignment.type !== AssignmentType.EXAM) {
    redirect("/student/assignments")
  }

  if (assignment.mySubmission?.submitted) {
    redirect(`/student/exams/${id}/results`)
  }

  const availability = getExamAvailability(assignment)
  const groupId = assignment.groupId ?? ""
  const questions = assignment.questions ?? []

  if (!availability.available || questions.length === 0) {
    return (
      <div className="mx-auto w-full max-w-md p-6 text-center space-y-4">
        <p className="text-4xl">📝</p>
        <h1 className="text-lg font-bold">{assignment.title}</h1>
        <p className="text-sm text-muted-foreground">
          {availability.notYet
            ? `الامتحان يبدأ ${availability.fromLabel}`
            : availability.expired
              ? "انتهى وقت هذا الامتحان"
              : "لا يمكن بدء هذا الامتحان حالياً"}
        </p>
        <Button asChild variant="outline">
          <Link href="/student/exams">العودة إلى الامتحانات</Link>
        </Button>
      </div>
    )
  }

  return <ExamTaker assignment={assignment} groupId={groupId || resolveId(assignment)} />
}
