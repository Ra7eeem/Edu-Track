import { TopBar } from "@/shared/components/layout/topbar"
import { loadTeacherMessages } from "@/features/teacher/lib/load-messages"
import { TeacherMessagesClient } from "./messages-client"

export default async function TeacherMessagesPage() {
  const messages = await loadTeacherMessages()

  return (
    <div className="flex flex-col">
      <TopBar
        title="الرسائل المجهولة"
        notifHref="/teacher/notifications"
        userName=""
        userAvatar="م"
        userAvatarColor="bg-primary"
        profileHref="/teacher/profile"
      />

      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <TeacherMessagesClient messages={messages} />
      </div>
    </div>
  )
}
