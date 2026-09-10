import { TopBar } from "@/shared/components/layout/topbar"
import Link from "next/link"
import { loadGroupDetail, loadTeachers } from "@/features/admin/lib/load-admin"
import { AdminGroupDetailClient } from "./admin-group-detail-client"
import { Button } from "@/shared/components/ui/button"

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [detail, allTeachers] = await Promise.all([
    loadGroupDetail(id),
    loadTeachers("", 1),
  ])

  const group = detail.group

  return (
    <div className="flex flex-col">
      <TopBar
        title={group?.name ?? "مجموعة"}
        subtitle={
          group ? `أُنشئت ${new Date(group.createdAt).toLocaleDateString("ar-EG")}` : undefined
        }
        notifHref="/admin/dashboard"
        userName="مدير"
        userAvatar="ا"
        userAvatarColor="bg-rose-500"
        profileHref="/admin/dashboard"
      />

      {group ? (
        <AdminGroupDetailClient
          groupId={id}
          group={detail.group}
          teachers={detail.teachers}
          students={detail.students}
          posts={detail.posts}
          ranking={detail.ranking}
          allTeachers={allTeachers}
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <p className="text-muted-foreground">لم يتم العثور على المجموعة</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/admin/groups">العودة للمجموعات</Link>
          </Button>
        </div>
      )}
    </div>
  )
}