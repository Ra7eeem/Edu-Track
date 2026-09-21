import { Metadata } from "next"
import { TopBar } from "@/shared/components/layout/topbar"
import { ACADEMIC_STAGES } from "@/features/academic-stages/config/academic-stages.config"
import { notFound } from "next/navigation"
import { StageDetailsClient } from "./StageDetailsClient"

export async function generateMetadata({ params }: { params: Promise<{ stageId: string }> }): Promise<Metadata> {
  const { stageId } = await params;
  const stage = ACADEMIC_STAGES.find(s => s.id === stageId);
  return {
    title: stage ? `مرحلة ${stage.name}` : "تفاصيل المرحلة",
  }
}

export default async function AcademicStageDetailsPage({ params }: { params: Promise<{ stageId: string }> }) {
  const { stageId } = await params;
  const stage = ACADEMIC_STAGES.find(s => s.id === stageId);
  
  if (!stage) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title={stage.name}
        subtitle="استعراض الطلاب المقبولين في المجموعات"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 flex-1">
        <StageDetailsClient stage={stage} />
      </div>
    </div>
  )
}
