import { TopBar } from "@/shared/components/layout/topbar";
import { getSessionData } from "@/shared/lib/session";
import { StudentCoursesViewer } from "@/features/courses/components/StudentCoursesViewer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "دوراتي وكورساتي | إديو تراك",
  description: "متابعة ومشاهدة الكورسات والدروس التعليمية والواجبات المرئية",
};

export default async function StudentCoursesPage() {
  const session = await getSessionData();

  return (
    <div className="flex flex-col font-sans">
      <TopBar
        title="الكورسات والدروس"
        subtitle={`مرحباً، ${session?.name?.split(" ")[0] ?? ""}`}
        notifHref="/student/notifications"
        userName={session?.name ?? "طالب"}
        userAvatar={(session?.name ?? "ط")[0]}
        userAvatarColor="bg-primary text-primary-foreground"
        profileHref="/student/profile"
      />

      <main className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
        <StudentCoursesViewer />
      </main>
    </div>
  );
}
