import { TopBar } from "@/shared/components/layout/topbar"
import { loadGroups, loadTeachers } from "@/features/admin/lib/load-admin"
import { GroupToolbar } from "./group-toolbar"
import { GroupGrid } from "./group-grid"

export default async function AdminGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const search = q ?? ""

  const [groups, allTeachers] = await Promise.all([
    loadGroups(search),
    loadTeachers("", 1),
  ])

  return (
    <div className="flex flex-col">
      <TopBar
        title="المجموعات"
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
        <GroupToolbar initial={search} allTeachers={allTeachers} />
        <GroupGrid groups={groups} />
      </div>
    </div>
  )
}