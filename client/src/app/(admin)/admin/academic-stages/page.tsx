import type { Metadata } from "next"
import { TopBar } from "@/shared/components/layout/topbar"
import { ACADEMIC_STAGES } from "@/features/academic-stages/config/academic-stages.config"
import { AcademicStageSection } from "@/features/academic-stages/components/AcademicStageSection"

export const metadata: Metadata = {
  title: "المراحل الدراسية",
  description: "عرض الطلاب مرتّبين حسب المراحل الدراسية",
}

/**
 * Admin — Academic Stages page (/admin/academic-stages).
 *
 * Server Component: no data is pre-fetched on the server (each AcademicStageSection
 * is a Client Component that fetches its own students via React Query on mount).
 * This matches the existing pattern used on the Groups page.
 *
 * The page does NOT display attendance data — attendance belongs to the Groups page.
 */
export default function AdminAcademicStagesPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="المراحل الدراسية"
        subtitle="الطلاب مرتّبون حسب مراحلهم الدراسية"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Page description */}
        <p className="text-sm text-muted-foreground">
          يمكنك هنا استعراض جميع الطلاب مُصنَّفين حسب مراحلهم الدراسية.
          اختر السنة الدراسية لكل مرحلة لعرض طلاب تلك المرحلة.
        </p>

        {/* One section per academic stage */}
        {ACADEMIC_STAGES.map((stage) => (
          <AcademicStageSection key={stage.id} stage={stage} />
        ))}
      </div>
    </div>
  )
}
