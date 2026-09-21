import type { Metadata } from "next"
import { TopBar } from "@/shared/components/layout/topbar"
import { ACADEMIC_STAGES } from "@/features/academic-stages/config/academic-stages.config"
import Link from "next/link"
import { Users } from "lucide-react"

export const metadata: Metadata = {
  title: "المراحل الدراسية",
  description: "المراحل الدراسية والطلاب",
}

export default function AdminAcademicStagesPage() {
  return (
    <div className="flex flex-col">
      <TopBar
        title="المراحل الدراسية"
        subtitle="المراحل الدراسية المتاحة في النظام"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
        <p className="text-sm text-muted-foreground">
          اختر المرحلة الدراسية لاستعراض الطلاب المقبولين في المجموعات التابعة لها.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACADEMIC_STAGES.map((stage) => (
            <Link
              href={`/admin/academic-stages/${stage.id}`}
              key={stage.id}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 text-center transition-all hover:border-primary/50 hover:shadow-md hover:bg-primary/5"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Users className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{stage.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stage.grades.length} صف دراسي
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
