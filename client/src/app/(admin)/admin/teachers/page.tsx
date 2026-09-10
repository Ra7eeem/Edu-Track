import { TopBar } from "@/shared/components/layout/topbar"
import { TeacherSearch } from "./teacher-search"
import { ModalManager } from "./modal-manager"
import { TeacherList } from "./teacher-list"
import { loadTeachers } from "@/features/admin/lib/load-admin"

export default async function AdminTeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const search = q ?? ""
  const teachers = await loadTeachers(search)

  return (
    <div className="flex flex-col">
      <TopBar
        title="إدارة المدرسين"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <TeacherSearch key={search} initial={search} />
          <ModalManager addButtonLabel="إضافة مدرس" />
        </div>

        <TeacherList teachers={teachers} />
      </div>
    </div>
  )
}