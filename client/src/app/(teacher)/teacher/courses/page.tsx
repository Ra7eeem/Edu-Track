import { TopBar } from "@/shared/components/layout/topbar";
import { getSessionData } from "@/shared/lib/session";
import { TeacherCoursesManager } from "@/features/courses/components/TeacherCoursesManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "الكورسات والدروس | إديو تراك",
  description: "إدارة ومتابعة الكورسات والدروس التعليمية وتحليلات مشاهدة الطلاب",
};

export default async function TeacherCoursesPage() {
  const session = await getSessionData();

  return (
    <div className="flex flex-col font-sans">
      <TopBar
        title="الكورسات والدروس"
        subtitle={`مرحباً، ${session?.name ?? ""}`}
        notifHref="/teacher/notifications"
        userName={session?.name ?? ""}
        userAvatar={(session?.name ?? "م")[0]}
        userAvatarColor="bg-primary text-primary-foreground"
        profileHref="/teacher/profile"
      />

      <main className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
        <TeacherCoursesManager />
      </main>
    </div>
  );
}
