import { Metadata } from "next"
import { TopBar } from "@/shared/components/layout/topbar"
import { StudentProfileClient } from "./StudentProfileClient";

export const metadata: Metadata = {
  title: "ملف الطالب",
  description: "ملف الطالب الشامل",
}

export default async function AdminStudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="ملف الطالب"
        subtitle="تفاصيل وأداء الطالب"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/profile"
      />

      <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6 flex-1">
        <StudentProfileClient studentId={id} />
      </div>
    </div>
  )
}
